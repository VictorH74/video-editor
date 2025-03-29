import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import { Directions, TextBoxType } from "@/types";
import React from "react";

export interface TextBoxProps {
  index: number;
  textBox: TextBoxType;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function useTextBox(props: TextBoxProps) {
  const { setTextList } = useEditorToolsCtx();

  const changeDirectionsByIndex = (values: Directions) => {
    setTextList((prev) =>
      prev.map((t, i) => (i === props.index ? { ...t, directions: values } : t))
    );
  };

  const changeContentByIndex = (value: string) => {
    setTextList((prev) =>
      prev.map((t, i) => (i === props.index ? { ...t, content: value } : t))
    );
  };

  const removeBoxByIndex = () => {
    setTextList((prev) => prev.filter((_, i) => i !== props.index));
  };

  return { changeDirectionsByIndex, changeContentByIndex, removeBoxByIndex };
}
