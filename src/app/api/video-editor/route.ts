import { randomUUID } from "crypto";
import ffmpeg, { FilterSpecification } from "fluent-ffmpeg";
import fs from "fs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// TODO: disabel add_text and add_img filters when rotate filter is aplied

type FilterType =
  | "trim"
  | "crop"
  | "scale"
  | "transpose"
  | "hflip"
  | "vflip"
  | "speed";

// e.g.: "00-00-5.247" -> "00:00:5.247"
const formatTime = (timeStr: string) => {
  return timeStr.replaceAll("-", ":");
};

const generateSpeedAtempoFilterObjs = (speedStr: string) => {
  const videoSpeed = parseFloat(speedStr);
  const atempoValues = [];

  if (videoSpeed > 2) {
    let currentValue = videoSpeed;

    while (currentValue > 2) {
      currentValue = currentValue / 2;
      atempoValues.push(2);

      if (currentValue <= 2) atempoValues.push(currentValue);
    }
  } else if (videoSpeed < 0.5) {
    let currentValue = videoSpeed;

    while (currentValue < 0.5) {
      currentValue = currentValue / 0.5;
      atempoValues.push(0.5);

      if (currentValue >= 0.5) atempoValues.push(currentValue);
    }
  } else {
    atempoValues.push(videoSpeed);
  }

  return atempoValues.map((value, index) => ({
    filter: "atempo",
    options: value,
    inputs: `intermediate_audio${index}`,
    outputs: `intermediate_audio${index + 1}`,
  }));
};

const generateFilePaths = async (file: File) => {
  if (!file) {
    throw new Error("No file received.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // build the complete path to our 'public/uploads' directory
  const filePath = path.join(process.cwd(), "public/uploads", file.name);
  const outputDir = path.resolve("public/uploads/output/");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputVideoPath = `${outputDir}/vheditor_${randomUUID()}_${file.name}`;

  // ensure the uploads directory exists
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  return {
    filePath,
    outputVideoPath,
  };
};

// cut ok - trim pen - scale ok - crop ok - hflip ok - w-flip ok - speed ok - volume pen - rotate ok - add_text pen - add_img pen
const getFilterComputedProps: Record<
  FilterType,
  (
    simpleFilterDataStr: string,
    videoComplexFilterList: Partial<ffmpeg.FilterSpecification>[],
    audioStreamComplexFilterList: Partial<ffmpeg.FilterSpecification>[]
  ) => void
> = {
  trim: (optionsStr, videoComplexFilterList, audioStreamComplexFilterList) => {
    const [start, duration] = optionsStr.split(":");

    audioStreamComplexFilterList.push({
      filter: "atrim",
      options: {
        start: formatTime(start),
        duration: formatTime(duration),
      },
      outputs: "intermediate_trim_audio",
    });
    audioStreamComplexFilterList.push({
      filter: "asetpts",
      options: "PTS-STARTPTS",
      inputs: "intermediate_trim_audio",
      outputs: "trimmed_audio",
    });

    videoComplexFilterList.push({
      filter: "trim",
      options: {
        start: formatTime(start),
        duration: formatTime(duration),
      },
      outputs: "intermediate_trim_video",
    });

    videoComplexFilterList.push({
      filter: "setpts",
      options: "PTS-STARTPTS",
      inputs: "intermediate_trim_video",
      outputs: "trimmed_video",
    });
  },
  crop: (optionsStr, videoComplexFilterList) => {
    const [out_w, out_h, x, y] = optionsStr.split(":");
    videoComplexFilterList.push({
      filter: "crop",
      options: { out_w, out_h, x, y },
      outputs: "cropped",
    });
  },
  scale: (optionsStr, videoComplexFilterList) => {
    const [w, h] = optionsStr.split(":");
    videoComplexFilterList.push({
      filter: "scale",
      options: { w: Number(w), h: Number(h) },
      outputs: "scaled",
    });
  },
  transpose: (optionsStr, videoComplexFilterList) => {
    videoComplexFilterList.push({
      filter: "transpose",
      options: optionsStr,
      outputs: "transposed",
    });
  },
  hflip: (_optionsStr, videoComplexFilterList) => {
    videoComplexFilterList.push({
      filter: "hflip",
      outputs: "hflipped",
    });
  },
  vflip: (_optionsStr, videoComplexFilterList) => {
    videoComplexFilterList.push({
      filter: "vflip",
      outputs: "vflipped",
    });
  },
  speed: (optionsStr, videoComplexFilterList, audioStreamComplexFilterList) => {
    audioStreamComplexFilterList.push(
      ...generateSpeedAtempoFilterObjs(optionsStr)
    );
    videoComplexFilterList.push({
      filter: "setpts",
      options: "PTS/" + optionsStr,
      outputs: "setptsends",
    });
  },
};

export async function POST(req: Request) {
  const formData = await req.formData();
  // const cutTrimCommand = formData.get("cutTrimCommand")
  const simpleComplexFilterStr = formData.get(
    "simpleComplexFilterStr"
  ) as string;

  try {
    const { filePath, outputVideoPath } = await generateFilePaths(
      formData.get("file") as File
    );

    // TODO: limit video resolution up to 360 instead 240

    const audioStreamComplexFilterList: Partial<ffmpeg.FilterSpecification>[] =
      [];

    const filterStrList = simpleComplexFilterStr.split("_");

    const videoComplexFilterList: Partial<ffmpeg.FilterSpecification>[] = [];

    filterStrList.forEach((simpleFilterDataStr) => {
      const [filterName, filterOptions] = simpleFilterDataStr.split("=");

      getFilterComputedProps[filterName as FilterType](
        filterOptions,
        videoComplexFilterList,
        audioStreamComplexFilterList
      );
    });

    for (let i = 0; i < videoComplexFilterList.length; i++) {
      const complexFilter = videoComplexFilterList[i];

      complexFilter.inputs =
        i == 0 ? "0:v" : videoComplexFilterList[i - 1].outputs;

      if (i + 1 == videoComplexFilterList.length) complexFilter.outputs = "v";
    }

    for (let i = 0; i < audioStreamComplexFilterList.length; i++) {
      const complexFilter = audioStreamComplexFilterList[i];

      complexFilter.inputs =
        i == 0 ? "0:a" : audioStreamComplexFilterList[i - 1].outputs;

      if (i + 1 == audioStreamComplexFilterList.length)
        complexFilter.outputs = "a";
    }

    const complexFilters = [
      ...videoComplexFilterList,
      ...audioStreamComplexFilterList,
    ];

    console.log("filters to apply: ", complexFilters);

    const hasAudioStream = audioStreamComplexFilterList.length > 0;

    let ffmpegInstance = ffmpeg(filePath)
      .inputOptions(["-ss 00:00:07.500"]) // cut
      .duration("00:00:05")
      .videoCodec("libx264")
      .audioCodec("aac")
      .complexFilter(complexFilters as FilterSpecification[])
      .map("v");

    if (hasAudioStream) ffmpegInstance = ffmpegInstance.map("a");

    ffmpegInstance
      .output(outputVideoPath)
      .on("end", () => {
        console.log("Processamento concluído com sucesso.");
      })
      .on("error", (err) => {
        console.error("Erro durante o processamento:", err);
      })
      .run();

    return Response.json({
      message: "File uploaded successfully!",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { message: "Error uploading file.", error: String(error) },
      { status: 500 }
    );
  }
}
