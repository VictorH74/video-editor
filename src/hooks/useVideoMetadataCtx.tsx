import React from "react";
import { videoMetadataCtx } from "@/contexts/videoMetadataCtx";

export default function useVideoMetadataCtx() {
  const context = React.useContext(videoMetadataCtx);
  if (!context) {
    throw new Error("useVideoMetadataCtx must be used within a VideoMetadataProvider");
  }
  return context;
}
