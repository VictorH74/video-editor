import EditorToolsProvider from "@/contexts/editorToolsCtx";
import OutputVideoProvider from "@/contexts/outputVideoCtx";
import CropBoxProvider from "@/contexts/cropBoxCtx";
import VideoMetadataProvider from "@/contexts/videoMetadataCtx";
import React from "react";

interface Props {
  children: React.ReactElement;
}

export default function Providers({ children }: Props) {
  return (
    <EditorToolsProvider>
      <CropBoxProvider>
        <VideoMetadataProvider>
          <OutputVideoProvider>{children}</OutputVideoProvider>
        </VideoMetadataProvider>
      </CropBoxProvider>
    </EditorToolsProvider>
  );
}
