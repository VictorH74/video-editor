"use client";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import DownloadFinalVideo from "@/ui/DownloadFinalVideo";
import EditorWorkSpace from "@/ui/EditorWorkSpace";
import ProgressingPage from "@/ui/ProgressingPage";
import SelectVideoFile from "@/ui/SelectVideoFile";
import React from "react";

export default function Home() {
  const { videoUrl } = useVideoMetadataCtx();
  const { exportedVideoUrl, processingVideo } = useOutputVideoCtx();

  // return <ProgressingPage />;

  if (exportedVideoUrl) return <DownloadFinalVideo />;
  if (processingVideo) return <ProgressingPage />;

  return <main>{videoUrl ? <EditorWorkSpace /> : <SelectVideoFile />}</main>;
}
