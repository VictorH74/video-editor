"use client";
import React from "react";

interface Props {
  videoFile: File | null;
  videoUrl: string | null;
  videoName: string | null;
  videoType: string | null;
  videoResolution: { w: number; h: number } | undefined;

  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoName: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoType: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoResolution: React.Dispatch<
    React.SetStateAction<{ w: number; h: number } | undefined>
  >;
}

export const videoMetadataCtx = React.createContext<Props | null>(null);

export default function VideoMetadataProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [videoName, setVideoName] = React.useState<string | null>(null);
  const [videoType, setVideoType] = React.useState<string | null>(null);
  const [videoResolution, setVideoResolution] = React.useState<{
    w: number;
    h: number;
  }>();

  React.useEffect(() => {
    if (!videoFile) return;

    const videoUrl = URL.createObjectURL(videoFile);
    setVideoUrl(videoUrl);
    setVideoName(videoFile.name);
    setVideoType(videoFile.type);
  }, [videoFile]);

  return (
    <videoMetadataCtx.Provider
      value={{
        videoFile,
        videoUrl,
        videoName,
        videoType,
        videoResolution,
        setVideoFile,
        setVideoUrl,
        setVideoName,
        setVideoType,
        setVideoResolution,
      }}
    >
      {children}
    </videoMetadataCtx.Provider>
  );
}
