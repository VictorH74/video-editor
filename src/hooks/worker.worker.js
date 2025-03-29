import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from "@ffmpeg/util";

self.onmessage = async (e) => {
    const { videoUrl, command, cropArea, videoWidth, videoHeight } = e.data

    const ffmpeg = new FFmpeg()

    const load = async () => {
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
        ffmpeg.on('log', ({ message }) => {
            console.log(message)
        });
        ffmpeg.on('progress', ({ progress }) => {
            self.postMessage({type: "progress", data: progress});
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
    }

    await load()

    ffmpeg.writeFile("input.mp4", await fetchFile(videoUrl));

    await ffmpeg.exec(command.split(" "));

    const [left, top, right, bottom] = Object.values(cropArea).map((v) =>
        parseFloat(v)
    );
    
    const w = videoWidth - ((left / 100 * videoWidth) + (right / 100 * videoWidth))
    const h = videoHeight - ((top / 100 * videoHeight) + (bottom / 100 * videoHeight))
    const x = (left / 100) * videoWidth
    const y = (top / 100) * videoHeight

    // crop=w:h:x:y'
    await ffmpeg.exec([
        "-i",
        "output.mp4",
        "-vf",
        `crop=${w}:${h}:${x}:${y}`,
        "-c:a",
        "copy",
        "output2.mp4",
    ]);

    const data = (await ffmpeg.readFile("output2.mp4"));
    // Criar uma Blob a partir dos dados
    const blob = new Blob([data.buffer], { type: "video/mp4" });
    // Criar uma URL para a Blob
    self.postMessage({type: "finished", data: URL.createObjectURL(blob)});
}