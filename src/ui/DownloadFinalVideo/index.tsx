"use client";

import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";


// background: linear-gradient(90deg, rgba(255,191,205,1) 10%, rgba(0,134,255,1) 47%, rgba(255,0,78,1) 100%);

// bg-linear-to-r from-indigo-500 from-10% via-sky-400 via-47% to-red-600 to-100%

export default function DownloadFinalVideo() {
  const { exportedVideoUrl } = useOutputVideoCtx();
  const { videoName } = useVideoMetadataCtx();

  return (
    <div className="h-screen grid place-items-center">
      <main className="flex flex-col gap-6 text-center">
        <div className="flex">
          <h2 className="text-7xl bg-linear-to-r from-red-200 from-10% via-blue-500 via-50% to-cyan-400 to-100% bg-clip-text text-transparent">
            Tudo pronto!
          </h2>
          <span className="text-7xl bg-cyan-400 bg-clip-text text-transparent animate-shake">
            👍
          </span>
        </div>
        <a
          href={exportedVideoUrl!}
          download={`${videoName}__vh-editor.mp4`}
          className="bg-linear-to-r from-red-200 from-10% via-blue-500 via-50% to-cyan-400 to-100% uppercase font-medium p-4 rounded-lg text-white hover:scale-105 duration-200"
        >
          Clique aqui para baixar o vídeo
        </a>
      </main>
    </div>
  );
}
