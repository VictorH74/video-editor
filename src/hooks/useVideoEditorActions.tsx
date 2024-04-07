/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import React from "react";
import useVideoMetadataCtx from "./useVideoMetadataCtx";
import useEditorToolsCtx from "./useEditorToolsCtx";
import useOutputVideoCtx from "./useOutputVideoCtx";

export type DataType = {
  videoUrl: string;
  command: string;
};

export default function useVideoEditorCtxActions() {
  const ffmpegRef = React.useRef(new FFmpeg());
  const { videoUrl, videoResolution } = useVideoMetadataCtx();
  const {
    videoStartTime,
    videoEndTime,
    videoDuration,
    cropArea,
    flipH,
    flipV,
    cutAction,
  } = useEditorToolsCtx();
  const { setProgress } = useOutputVideoCtx();

  // React.useEffect(() => {
  //   load();
  // }, []);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;

    if (process.env.NODE_ENV === "development") {
      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });
    }

    ffmpeg.on("progress", ({ progress }) => {
      console.log(progress);
      setProgress([progress]);
    });

    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
  };

  const strToCommand = (commandStr: string) => commandStr.split(" ");

  const createUrl = async (outputName?: string) => {
    const ffmpeg = ffmpegRef.current;

    const data = (await ffmpeg.readFile(outputName || "output.mp4")) as any;
    // Criar uma Blob a partir dos dados
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    // Criar uma URL para a Blob
    return URL.createObjectURL(blob);
  };

  const processVideo = async () => {
    await load();

    const ffmpeg = ffmpegRef.current;
    ffmpeg.writeFile("input.mp4", await fetchFile(videoUrl!));
    const execCommand: string[] = []
    const vfRequired: string[] = []
    // let decodeAudio = false
    let inputName = "input.mp4"

    // trim or cut
    if (videoStartTime > 0 || videoEndTime < videoDuration!) {
      inputName = "cut-trim.mp4"
      await ({
        trim: async () => {
          const command = `-ss ${videoStartTime.toString()} -to ${videoEndTime.toString()} -i input.mp4 -c copy ${inputName}`;
          await ffmpeg.exec(strToCommand(command));
        },
        cut: async () => {
          const part1 = `-i input.mp4 -t ${videoStartTime.toString()} -c copy part1.mp4`;
          const part2 = `-i input.mp4 -ss ${videoEndTime.toString()} -c copy part2.mp4`;

          const concatParts = `-f concat -safe 0 -i list.txt -c copy ${inputName}`;

          await ffmpeg.exec(strToCommand(part1));
          await ffmpeg.exec(strToCommand(part2));

          ffmpeg.writeFile(
            "list.txt",
            ["file 'part1.mp4'", "file 'part2.mp4'"].join("\n")
          );

          await ffmpeg.exec(strToCommand(concatParts));
        },
      })[cutAction]()
      // decodeAudio = true
    }

    // crop
    if (Object.values(cropArea).map((v) => parseFloat(v)).reduce((total, v) => total + v, 0) > 0) {
      const [left, top, right, bottom] = Object.values(cropArea).map((v) =>
        parseFloat(v)
      );

      const videoWidth = videoResolution!.w
      const videoHeight = videoResolution!.h

      const w = videoWidth - ((left / 100 * videoWidth) + (right / 100 * videoWidth))
      const h = videoHeight - ((top / 100 * videoHeight) + (bottom / 100 * videoHeight))
      const x = (left / 100) * videoWidth
      const y = (top / 100) * videoHeight
      vfRequired.push(`crop=${w}:${h}:${x}:${y}`)
    }

    // flip
    if (flipH) vfRequired.push("hflip");
    if (flipV) vfRequired.push("vflip");

    if (vfRequired.length > 0) execCommand.push(...["-vf", vfRequired.join(",")])

    // if (!decodeAudio) execCommand.push(...["-c:a", "copy"])
    execCommand.push(...["-c:a", "copy"])

    execCommand.unshift(...["-i", inputName])
    execCommand.push("output.mp4")
    console.log(execCommand)

    await ffmpeg.exec(execCommand);
    return createUrl();
  }

  const addTextOnVideo = async (
    text: string = "Me nombre es Victor A",
    x: number = 10,
    y: number = 10,
    fontSize: number = 24,
    fontcolor: string = "white"
  ) => {
    const ffmpeg = ffmpegRef.current;

    // Escrever o arquivo de vídeo
    ffmpeg.writeFile("input.mp4", await fetchFile(videoUrl!));

    await ffmpeg.writeFile(
      "arial.ttf",
      await fetchFile(
        "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf"
      )
    );

    //fontfile=/arial.ttf:
    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-vf",
      `drawtext=fontfile=/arial.ttf:text=\'${text}\':x=${x}:y=${y}:fontsize=${fontSize}:fontcolor=${fontcolor}`,
      "output.mp4",
    ]);

    return createUrl();
  };

  return {
    addTextOnVideo,
    processVideo,
  };
}
