import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // error out if no file is received via FormData
    if (!file) {
      return Response.json({ error: "No file received." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // build the complete path to our 'public/uploads' directory
    const filePath = path.join(process.cwd(), "public/uploads", file.name);
    const outputDir = path.resolve("public/uploads/output/");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputVideoPath = `${outputDir}/vheditor_${file.name}`;

    // ensure the uploads directory exists
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    // "-filter_complex [0:v]crop=733.4995199999998:1080:531.74976:0,hflip,setpts=PTS/1.58[v];[0:a]atempo=1.58[a] -map [v] -map [a]"

    ffmpeg(filePath)
      .inputOptions(["-ss 00:00:07.500"]) // Seek preciso antes de processar
      .duration("00:00:05")
      .videoCodec("libx264")
      .audioCodec("aac")
      .complexFilter([
        {
          filter: "crop",
          options: {
            out_w: "733.4995199999998",
            out_h: "1080",
            x: "531.74976",
            y: "0",
          },
          inputs: "0:v",
          outputs: "cropped",
        },
        {
          filter: "hflip",
          inputs: "cropped",
          outputs: "flipped",
        },
        {
          filter: "setpts",
          options: "PTS/1.58",
          inputs: "flipped",
          outputs: "spedup_video",
        },
        {
          filter: "atempo",
          options: "1.58",
          inputs: "0:a",
          outputs: "spedup_audio",
        },
      ])
      .map("spedup_video")
      .map("spedup_audio")
      .output(outputVideoPath)
      .on("end", () => {
        console.log("Processamento concluído com sucesso.");
      })
      .on("error", (err) => {
        console.error("Erro durante o processamento:", err);
      })
      .run();

    // ffmpeg(filePath)
    //   .videoCodec("libx264")
    //   .complexFilter([
    //     {
    //       filter: "crop",
    //       options: {
    //         out_w: "733.4995199999998",
    //         out_h: "1080",
    //         x: "531.74976",
    //         y: "0",
    //       },
    //       inputs: "0:v",
    //       outputs: "cropped",
    //     },
    //     {
    //       filter: "hflip",
    //       inputs: "cropped",
    //       outputs: "flipped",
    //     },
    //     {
    //       filter: "setpts",
    //       options: "PTS/1.58",
    //       inputs: "flipped",
    //       outputs: "spedup_video",
    //     },
    //     {
    //       filter: "atempo",
    //       options: "1.58",
    //       inputs: "0:a",
    //       outputs: "spedup_audio",
    //     },
    //   ])
    //   .map("spedup_video")
    //   .map("spedup_audio")
    //   .on("end", () => {
    //     console.log("Processamento concluído com sucesso.");
    //   })
    //   .on("error", (err) => {
    //     console.error("Erro durante o processamento:", err);
    //   })
    //   .save(outputVideoPath);

    // ffmpeg(filePath)
    //   .output(outputVideoPath)
    //   .videoCodec("libx264")
    //   .complexFilter([])
    //   .size("1280x720")
    //   .outputOptions("-crf 28")
    //   .on("end", () => {
    //     console.log("sucesso!!");
    //   })
    //   .on("error", (err) => {
    //     console.log("========================");
    //     console.error(err);
    //     console.log("========================");
    //   })
    //   .run();

    console.log(file);

    return Response.json({
      message: "File uploaded successfully!",
    });
  } catch (error) {
    // handle any unknown error
    console.error(error);
    return Response.json({ error: "Error uploading file." }, { status: 500 });
  }
}
