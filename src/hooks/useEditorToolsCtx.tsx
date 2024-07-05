import React from "react";
import { editorToolsCtx } from "@/contexts/editorToolsCtx";

export default function useEditorToolsCtx() {
  const context = React.useContext(editorToolsCtx);
  if (!context) {
    throw new Error("useEditorToolsCtx must be used within a EditorToolsProvider");
  }
  return context;
}
