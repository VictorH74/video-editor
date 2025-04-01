import { randomUUID } from "crypto";
import { getStorage } from "firebase-admin/storage";
import ffmpeg, { FilterSpecification } from "fluent-ffmpeg";
import fs from "fs";
import { readFile, unlink } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import "@/configs/firebaseAdminConfig";

import {
  FilterType,
  generateVideoComplexFilter,
  FilterObjType,
  generateVideoPaths,
} from "./util/functions";

const bucket = getStorage().bucket();

// TODO: disabel add_text and add_img filters when rotate filter is aplied

export async function POST(req: NextRequest) {
  const simpleComplexFilterStr = req.nextUrl.searchParams.get(
    "simpleComplexFilterStr"
  ) as string;
  const fileType = req.headers.get("fileType");

  if (!simpleComplexFilterStr) {
    return new Response("param 'simpleComplexFilterStr' not provided", {
      status: 400,
    });
  }

  if (!fileType) {
    return new Response("not found required props `fileType` in headers ", {
      status: 400,
    });
  }

  console.log(simpleComplexFilterStr);
  console.log(fileType);

  try {
    let inputVideoPath: string;
    let outputVideoPath: string;

    if (process.env.NODE_ENV == "production") {
      const fileExtension = fileType.split(`/`)[1];
      inputVideoPath = path.join(
        "tmp/",
        `input-${randomUUID()}.${fileExtension}`
      );
      outputVideoPath = path.join(
        "tmp/",
        `output-${randomUUID()}.${fileExtension}`
      );

      const writeStream = fs.createWriteStream(inputVideoPath);
      const pipelineAsync = promisify(pipeline);
      await pipelineAsync(
        req.body as unknown as NodeJS.ReadableStream,
        writeStream
      );
    } else {
      const formData = await req.formData();
      const paths = await generateVideoPaths(formData.get("file") as File);
      inputVideoPath = paths.inputVideoPath;
      outputVideoPath = paths.outputVideoPath;
    }

    // TODO: limit video resolution up to 360 instead 240

    const filterStrList = simpleComplexFilterStr.split("_");

    const videoComplexFilterList: FilterObjType[] = [];
    const audioComplexFilterList: FilterObjType[] = [];

    // Adapting video filters
    filterStrList.forEach((simpleFilterDataStr) => {
      const [filterName, filterOptions] = simpleFilterDataStr.split("=");

      generateVideoComplexFilter[filterName as FilterType](
        filterOptions,
        videoComplexFilterList,
        audioComplexFilterList
      );
    });

    // Connect video filters stream
    for (let i = 0; i < videoComplexFilterList.length; i++) {
      const complexFilter = videoComplexFilterList[i];

      complexFilter.inputs =
        i == 0 ? "0:v" : videoComplexFilterList[i - 1].outputs;

      if (i + 1 == videoComplexFilterList.length) complexFilter.outputs = "v";
    }

    // Connect audio filters stream
    for (let i = 0; i < audioComplexFilterList.length; i++) {
      const complexFilter = audioComplexFilterList[i];

      complexFilter.inputs =
        i == 0 ? "0:a" : audioComplexFilterList[i - 1].outputs;

      if (i + 1 == audioComplexFilterList.length) complexFilter.outputs = "a";
    }

    // Join audio and video filters
    const complexFilters = [
      ...videoComplexFilterList,
      ...audioComplexFilterList,
    ];

    console.log("filters to apply: ", complexFilters);

    const hasAudioStream = audioComplexFilterList.length > 0;

    const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");

    let ffmpegInstance = ffmpeg(inputVideoPath)
      .setFfmpegPath(ffmpegInstaller.path)
      .videoCodec("libx264")
      .audioCodec("aac")
      .complexFilter(complexFilters as FilterSpecification[])
      .map("v");

    if (hasAudioStream) ffmpegInstance = ffmpegInstance.map("a");

    const readableStream = new ReadableStream({
      start(controller) {
        function push() {
          ffmpegInstance
            .output(outputVideoPath)
            .on("end", async () => {
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ progress: 100 }))
              );

              await new Promise<void>((res) => {
                setTimeout(() => {
                  res();
                }, 4000);
              });

              const file = await readFile(outputVideoPath);

              console.log(file.length);

              // TODO: upload output vídeo to firebase storage
              await unlink(inputVideoPath);
              await unlink(outputVideoPath);

              // TODO: return output video url to client
              // TODO: apply cron to remove videos from firebase
              const filename = `vheditor-uploads/${randomUUID()}.${
                fileType!.split("/")[1]
              }`;
              const bucketFile = bucket.file(filename);

              // 🔹 Criar stream para o upload
              const writeStream = bucketFile.createWriteStream({
                metadata: { contentType: fileType! },
                resumable: false,
              });

              // 🔹 Convertendo o `req.body` para stream
              const readable = new Readable();
              readable._read = () => {}; // Necessário para streams customizadas
              readable.push(Buffer.from(file.buffer));

              // readable.push(await req.arrayBuffer());
              readable.push(null);

              // 🔹 Fazer upload do vídeo para o Firebase Storage
              await new Promise((resolve, reject) => {
                readable
                  .pipe(writeStream)
                  .on("finish", resolve)
                  .on("error", reject);
              });

              // 🔹 Gerar URL pública (opcional)
              await bucketFile.makePublic();
              const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ videoUrl: publicUrl })
                )
              );

              controller.close();
            })
            .on("error", (err) => {
              console.error("An error occurred:", err);
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ error: err.message }))
              );
              controller.close();
            })
            .on("progress", (e) => {
              console.log(e.percent);
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({ progress: e.percent })
                )
              );
            })
            .run();
        }

        push();
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "application/octet-stream" }, // Definir corretamente o tipo da resposta
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error uploading file.", error: String(error) },
      { status: 500 }
    );
  }
}
