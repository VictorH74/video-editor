"use client";
import React from "react";

interface Props {
  videoUrl: string | null;
  videoName: string | null;
  videoResolution: { w: number; h: number } | undefined;

  setVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoName: React.Dispatch<React.SetStateAction<string | null>>;
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
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [videoName, setVideoName] = React.useState<string | null>(null);
  const [videoResolution, setVideoResolution] = React.useState<{
    w: number;
    h: number;
  }>();

  return (
    <videoMetadataCtx.Provider
      value={{
        videoUrl,
        videoName,
        videoResolution,
        setVideoUrl,
        setVideoName,
        setVideoResolution,
      }}
    >
      {children}
    </videoMetadataCtx.Provider>
  );
}
