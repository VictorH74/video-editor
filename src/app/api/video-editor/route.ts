import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg, { FilterSpecification } from "fluent-ffmpeg";
import fs from "fs";
import { unlink } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

// ffmpeg.setFfmpegPath(ffmpegPath.path);

import {
  FilterType,
  generateVideoComplexFilter,
  FilterObjType,
} from "./util/functions";

// TODO: disabel add_text and add_img filters when rotate filter is aplied

export async function POST(req: NextRequest) {
  console.log("Called");
  const simpleComplexFilterStr = req.nextUrl.searchParams.get(
    "simpleComplexFilterStr"
  );

  if (!simpleComplexFilterStr) {
    return new Response("param 'simpleComplexFilterStr' not provided", {
      status: 400,
    });
  }

  console.log(simpleComplexFilterStr);

  try {
    const tempVideoPath = path.join("/tmp", `input-${Date.now()}.mp4`);
    const outputVideoPath = path.join("/tmp", `output-${Date.now()}.mp4`);

    const writeStream = fs.createWriteStream(tempVideoPath);
    const pipelineAsync = promisify(pipeline);
    await pipelineAsync(
      req.body as unknown as NodeJS.ReadableStream,
      writeStream
    );

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

    let ffmpegInstance = ffmpeg(tempVideoPath)
      .setFfmpegPath(ffmpegPath.path)
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
            .on("end", () => {
              controller.enqueue(
                new TextEncoder().encode(JSON.stringify({ startVideo: true }))
              ); // Inicia o envio do vídeo

              const readStream = fs.createReadStream(outputVideoPath);

              readStream.on("data", (chunk) => {
                console.log("Received chunk:", chunk);
                controller.enqueue(
                  new Uint8Array(chunk as Buffer<ArrayBufferLike>)
                );
              });

              readStream.on("end", async () => {
                await unlink(tempVideoPath);
                await unlink(outputVideoPath);
                controller.close();
                console.log("Finished reading the file.");
              });

              readStream.on("error", (err) => {
                console.error(
                  "An error occurred in 'readStream':",
                  err.message
                );
                controller.enqueue(
                  new TextEncoder().encode(
                    JSON.stringify({ error: err.message })
                  )
                );
              });
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
