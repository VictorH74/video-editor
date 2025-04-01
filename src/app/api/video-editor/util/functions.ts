import { randomUUID } from "crypto";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export type FilterType =
  | "trim"
  | "cut"
  | "crop"
  | "scale"
  | "transpose"
  | "hflip"
  | "vflip"
  | "speed";

export type FilterObjType = Partial<ffmpeg.FilterSpecification>;

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

// cut ok - trim pen - scale ok - crop ok - hflip ok - w-flip ok - speed ok - volume pen - rotate ok - add_text pen - add_img pen
export const generateVideoComplexFilter: Record<
  FilterType,
  (
    simpleFilterDataStr: string,
    videoComplexFilterList: FilterObjType[],
    audioStreamComplexFilterList: FilterObjType[]
  ) => void
> = {
  trim: (optionsStr, videoComplexFilterList, audioStreamComplexFilterList) => {
    const [start, duration] = optionsStr.split(":");

    const audioConnectionStr = "intermediate_trim_audio";
    const videoConnectionStr = "intermediate_trim_video";

    // AUDIO STREAM
    audioStreamComplexFilterList.push({
      filter: "atrim",
      options: {
        start: start,
        duration: duration,
      },
      outputs: audioConnectionStr,
    });
    audioStreamComplexFilterList.push({
      filter: "asetpts",
      options: "PTS-STARTPTS",
      inputs: audioConnectionStr,
      outputs: "trimmed_audio",
    });

    // VIDEO STREAM
    videoComplexFilterList.push({
      filter: "trim",
      options: {
        start: start,
        duration: duration,
      },
      outputs: videoConnectionStr,
    });
    videoComplexFilterList.push({
      filter: "setpts",
      options: "PTS-STARTPTS",
      inputs: videoConnectionStr,
      outputs: "trimmed_video",
    });
  },
  cut: (optionsStr, videoComplexFilterList, audioStreamComplexFilterList) => {
    const [startTime, endTime] = optionsStr.split(":");

    const audioConnectionStr = "intermediate_cut_audio";
    const videoConnectionStr = "intermediate_cut_video";

    // AUDIO STREAM
    audioStreamComplexFilterList.push({
      filter: "aselect",
      options: `not(between(t,${startTime},${endTime}))`,
      outputs: audioConnectionStr,
    });
    audioStreamComplexFilterList.push({
      filter: "asetpts",
      options: "N/SR/TB",
      inputs: audioConnectionStr,
      outputs: "cutted_audio",
    });

    // VIDEO STREAM
    videoComplexFilterList.push({
      filter: "select",
      options: `not(between(t,${startTime},${endTime}))`,
      outputs: videoConnectionStr,
    });

    videoComplexFilterList.push({
      filter: "setpts",
      options: "N/FRAME_RATE/TB",
      inputs: videoConnectionStr,
      outputs: "cutted_video",
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

export const generateVideoPaths = async (file: File) => {
  if (!file) {
    throw new Error("No file received.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tempDir = "/tmp";
  const inputVideoPath = path.join(
    tempDir,
    `input-${randomUUID()}-${file.name}`
  );
  const outputVideoPath = path.join(
    tempDir,
    `output-${randomUUID()}-${file.name}`
  );

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  // ensure the uploads directory exists
  await mkdir(path.dirname(inputVideoPath), { recursive: true });
  await writeFile(inputVideoPath, buffer);

  const removeFiles = async () => {
    await unlink(inputVideoPath);
    await unlink(outputVideoPath);
  };

  return {
    inputVideoPath,
    outputVideoPath,
    removeFiles,
  };
};
