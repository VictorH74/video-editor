"use client";
import DownloadFinalVideo from "@/ui/DownloadFinalVideo";
import EditorWorkSpace from "@/ui/EditorWorkSpace";
import React from "react";
import SelectVideoFile from "@/ui/SelectVideoFile";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import ProgressingPage from "@/ui/ProgressingPage";

export default function Home() {
  const { videoUrl } = useVideoMetadataCtx();
  const { exportedVideoUrl, processingVideo } = useOutputVideoCtx();

  // return <ProgressingPage />;

  if (exportedVideoUrl) return <DownloadFinalVideo />;
  if (processingVideo) return <ProgressingPage />;

  return <main>{videoUrl ? <EditorWorkSpace /> : <SelectVideoFile />}</main>;
}
