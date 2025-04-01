"use client";
import React from "react";

interface Props {
  processingVideo: boolean;
  creatingVideoUrl: boolean;
  exportedVideoUrl: string | null;
  progress: number;
  statusMsg: string;
  setStatusMsg: React.Dispatch<React.SetStateAction<string>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setProcessingVideo: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatingVideoUrl: React.Dispatch<React.SetStateAction<boolean>>;
  setExportedVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export const outputVideoCtx = React.createContext<Props | null>(null);

export default function OutputVideoProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [statusMsg, setStatusMsg] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [processingVideo, setProcessingVideo] = React.useState(false);
  const [creatingVideoUrl, setCreatingVideoUrl] = React.useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = React.useState<string | null>(
    null
  );

  return (
    <outputVideoCtx.Provider
      value={{
        statusMsg,
        progress,
        processingVideo,
        creatingVideoUrl,
        exportedVideoUrl,
        setStatusMsg,
        setProgress,
        setProcessingVideo,
        setCreatingVideoUrl,
        setExportedVideoUrl,
      }}
    >
      {children}
    </outputVideoCtx.Provider>
  );
}
