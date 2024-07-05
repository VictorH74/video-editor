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
    cropArea,
    flipH,
    flipV,
    cutAction,
    speed,
    changed,
    // finalResolution,
  } = useEditorToolsCtx();
  const { setProgress, setStatusMsg } = useOutputVideoCtx();

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
      setProgress(progress);
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
    const filterComplex: string[] = []
    let inputName = "input.mp4"

    // execCommand.push(...["-filter_complex", `[0:v]setpts=PTS/${speed / 100}, vflip, hflip, ${getCropFilter()}[v]${audioSpeedFilter()}`, "-map", "[v]", "-map", "[a]"])
    // execCommand.push(...["-filter_complex", `[0:v]setpts=0.5*PTS, vflip, hflip, ${getCropFilter()}[v];[0:a]atempo=2.0[a]`, "-map", "[v]", "-map", "[a]"])
    // execCommand.push(...["-vf", `scale=-1:${finalResolution}`])

    // trim or cut
    if (changed.videoStartEndTime) {
      inputName = "cut-trim.mp4"
      await ({ trim, cut })[cutAction](inputName)
    }

    // resize
    // if (changed.resize) filterComplex.push(`scale=-1:${finalResolution}`)

    // crop
    if (changed.cropArea) filterComplex.push(getCropFilter())

    // flip
    if (flipH) filterComplex.push("hflip");
    if (flipV) filterComplex.push("vflip");

    // speed
    if (changed.speed) filterComplex.push(`setpts=PTS/${speed / 100}`);

    if (filterComplex.length > 0) {
      const filters: string[] = ["[0:v]" + filterComplex.join(",") + "[v]", "-map", "[v]"]
      if (changed.speed) {
        filters[0] += audioSpeedFilter()
        filters.push(...["-map", "[a]"])
      }
      else filters.push(...["-c:a", "copy"])
      execCommand.push(...["-filter_complex", ...filters])

      // execCommand.push(...["-c:a", "copy"])
      execCommand.unshift(...["-i", inputName])
      execCommand.push("output.mp4")
      console.log(execCommand)

      setStatusMsg("Aplicando filtros...")
      await ffmpeg.exec(execCommand);
      return createUrl();
    }

    return createUrl(inputName);
  }

  const audioSpeedFilter = () => {
    const videoSpeed = speed / 100
    const values = videoSpeed / 2 > 1 ? Array(Math.ceil(videoSpeed / 2)).fill(videoSpeed / 2) : [videoSpeed]
    return `;[0:a]${values.map(value => "atempo=" + value).join(",")}[a]`
    // return `;[0:a]atempo=${speed}[a]`
  }

  const trim = async (inputName: string) => {
    const ffmpeg = ffmpegRef.current;
    const command = `-ss ${videoStartTime.toString()} -to ${videoEndTime.toString()} -i input.mp4 -c copy ${inputName}`;
    setStatusMsg("Aparando vídeo...")
    await ffmpeg.exec(strToCommand(command));
  }

  const cut = async (inputName: string) => {
    const ffmpeg = ffmpegRef.current;
    const part1 = `-i input.mp4 -t ${videoStartTime.toString()} -c copy part1.mp4`;
    const part2 = `-i input.mp4 -ss ${videoEndTime.toString()} -c copy part2.mp4`;

    const concatParts = `-f concat -safe 0 -i list.txt -c copy ${inputName}`;

    setStatusMsg("Cortando vídeo...")
    await ffmpeg.exec(strToCommand(part1));
    await ffmpeg.exec(strToCommand(part2));

    ffmpeg.writeFile(
      "list.txt",
      ["file 'part1.mp4'", "file 'part2.mp4'"].join("\n")
    );

    await ffmpeg.exec(strToCommand(concatParts));
  }

  const getCropFilter = () => {
    const [left, top, right, bottom] = Object.values(cropArea).map((v) =>
      parseFloat(v)
    );

    const videoWidth = videoResolution!.w
    const videoHeight = videoResolution!.h

    const w = videoWidth - ((left / 100 * videoWidth) + (right / 100 * videoWidth))
    const h = videoHeight - ((top / 100 * videoHeight) + (bottom / 100 * videoHeight))
    const x = (left / 100) * videoWidth
    const y = (top / 100) * videoHeight

    return `crop=${w}:${h}:${x}:${y}`
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
