import { videoMetadataCtx } from "@/contexts/videoMetadataCtx";
import React from "react";

export default function useVideoMetadataCtx() {
  const context = React.use(videoMetadataCtx);
  if (!context) {
    throw new Error(
      "useVideoMetadataCtx must be used within a VideoMetadataProvider"
    );
  }
  return context;
}
