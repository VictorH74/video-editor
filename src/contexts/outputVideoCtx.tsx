"use client";
import React from "react";

interface Props {
  processingVideo: boolean;
  exportedVideoUrl: string | null;
  progress: number[];
  setProgress: React.Dispatch<React.SetStateAction<number[]>>
  setProcessingVideo: React.Dispatch<React.SetStateAction<boolean>>;
  setExportedVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export const outputVideoCtx = React.createContext<Props | null>(null);

export default function OutputVideoProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [progress, setProgress] = React.useState([0]);
  const [processingVideo, setProcessingVideo] = React.useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = React.useState<string | null>(
    null
  );


  return (
    <outputVideoCtx.Provider
      value={{
        progress,
        processingVideo,
        exportedVideoUrl,
        setProgress,
        setProcessingVideo,
        setExportedVideoUrl,
      }}
    >
      {children}
    </outputVideoCtx.Provider>
  );
}
