import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import { Directions, ImageBoxType } from "@/types";
import React from "react";

export interface ImageBoxProps {
  index: number;
  imageBox: ImageBoxType;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function useImageBox(props: ImageBoxProps) {
  const { setImageList } = useEditorToolsCtx();

  const changeDirectionsByIndex = (values: Directions) => {
    setImageList((prev) =>
      prev.map((t, i) => (i === props.index ? { ...t, directions: values } : t))
    );
  };

  const removeBoxByIndex = () => {
    setImageList((prev) => prev.filter((_, i) => i !== props.index));
  };

  return { changeDirectionsByIndex, removeBoxByIndex };
}
