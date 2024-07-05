/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useCropBoxCtx from "@/hooks/useCropBoxCtx";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import { DirectionType } from "@/types";
import React from "react";

export default function useCropBox() {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const { cropArea, setCropArea, toolAction } = useEditorToolsCtx();
  const {
    maskEastRef,
    maskNorthRef,
    maskSouthRef,
    maskWestRef,
    updateMasks,
    setDimentions,
  } = useCropBoxCtx();

  const moveMaskByDirection = (
    d: DirectionType,
    newValue: number,
    containerDimention: [number, number]
  ) => {
    const containerMeasure =
      containerDimention[["top", "bottom"].includes(d) ? 1 : 0];

    const value = `${(newValue / containerMeasure) * 100}%`;
    const revertedValue = `${
      ((containerMeasure - newValue) / containerMeasure) * 100
    }%`;

    switch (d) {
      case "left":
        maskWestRef.current!.style.right = revertedValue;
        break;
      case "top":
        maskNorthRef.current!.style.bottom = revertedValue;
        maskWestRef.current!.style.top = value;
        maskEastRef.current!.style.top = value;
        break;
      case "right":
        maskEastRef.current!.style.left = revertedValue;
        break;
      case "bottom":
        maskSouthRef.current!.style.top = revertedValue;
        maskWestRef.current!.style.bottom = value;
        maskEastRef.current!.style.bottom = value;
        break;
    }
  };

  return {
    containerRef,
    cropArea,
    maskWestRef,
    maskNorthRef,
    maskEastRef,
    maskSouthRef,
    moveMaskByDirection,
    setCropArea,
    updateMasks,
    setDimentions,
    toolAction,
  };
}
