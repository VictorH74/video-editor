import ffmpeg, { FilterSpecification } from "fluent-ffmpeg";
import fs from "fs";

import {
  FilterType,
  generateVideoPaths,
  generateVideoComplexFilter,
  FilterObjType,
} from "./util/functions";

// TODO: disabel add_text and add_img filters when rotate filter is aplied

export async function POST(req: Request) {
  const formData = await req.formData();
  // const cutTrimCommand = formData.get("cutTrimCommand")
  const simpleComplexFilterStr = formData.get(
    "simpleComplexFilterStr"
  ) as string;

  try {
    const { videoPath, outputVideoPath, removeFiles } =
      await generateVideoPaths(formData.get("file") as File);

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

    // Connect video stream
    for (let i = 0; i < videoComplexFilterList.length; i++) {
      const complexFilter = videoComplexFilterList[i];

      complexFilter.inputs =
        i == 0 ? "0:v" : videoComplexFilterList[i - 1].outputs;

      if (i + 1 == videoComplexFilterList.length) complexFilter.outputs = "v";
    }

    // Connect audio stream
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

    let ffmpegInstance = ffmpeg(videoPath)
      // .inputOptions(["-ss 00:00:07.500"]) // cut
      // .duration("00:00:05")
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
              controller.enqueue(JSON.stringify({ progress: 100 }));

              const readStream = fs.createReadStream(outputVideoPath, {
                encoding: "utf-8",
              });

              readStream.on("data", (chunk) => {
                console.log("Received chunk:", chunk);
                controller.enqueue(chunk);
              });

              readStream.on("end", async () => {
                await removeFiles();
                controller.close();
                console.log("Finished reading the file.");
              });

              readStream.on("error", (err) => {
                console.error(
                  "An error occurred in 'readStream':",
                  err.message
                );
                controller.enqueue(JSON.stringify({ error: err.message }));
              });
            })
            .on("error", (err) => {
              console.error("An error occurred:", err);
              controller.enqueue(JSON.stringify({ error: err.message }));
              controller.close();
            })
            .on("progress", (e) => {
              console.log(e.percent);
              controller.enqueue(JSON.stringify({ progress: e.percent }));
            })
            .run();
        }

        push();
      },
    });

    return new Response(readableStream);
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error uploading file.", error: String(error) },
      { status: 500 }
    );
  }
}
