import { editorToolsCtx } from "@/contexts/editorToolsCtx";
import React from "react";

export default function useEditorToolsCtx() {
  const context = React.use(editorToolsCtx);
  if (!context) {
    throw new Error(
      "useEditorToolsCtx must be used within a EditorToolsProvider"
    );
  }
  return context;
}
