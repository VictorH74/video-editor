"use client";
import { DimentionType } from "@/types";
import React from "react";

interface Props {
  maskWestRef: React.RefObject<HTMLDivElement | null>;
  maskNorthRef: React.RefObject<HTMLDivElement | null>;
  maskEastRef: React.RefObject<HTMLDivElement | null>;
  maskSouthRef: React.RefObject<HTMLDivElement | null>;
  dimentions: [DimentionType, DimentionType] | null;

  updateMasks: (directions: Directions) => void;
  setDimentions: React.Dispatch<
    React.SetStateAction<[DimentionType, DimentionType] | null>
  >;
}

type Directions = Record<"left" | "top" | "right" | "bottom", string>;

export const cropBoxCtx = React.createContext<Props | null>(null);

export default function CropBoxProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const maskWestRef = React.useRef<HTMLDivElement>(null);
  const maskNorthRef = React.useRef<HTMLDivElement>(null);
  const maskEastRef = React.useRef<HTMLDivElement>(null);
  const maskSouthRef = React.useRef<HTMLDivElement>(null);
  const [dimentions, setDimentions] = React.useState<
    [DimentionType, DimentionType] | null
  >(null); // resizable draggable and container dimentions: [[w, h], [w, h]]

  const updateMasks = (directions: Directions) => {
    const [floatLeft, floatTop, floatRight, floatBottom] = Object.entries(
      directions
    ).map((d) => parseFloat(d[1]));

    maskNorthRef.current!.style.bottom = 100 - floatTop + "%";
    maskEastRef.current!.style.left = 100 - floatRight + "%";
    maskWestRef.current!.style.right = 100 - floatLeft + "%";
    maskSouthRef.current!.style.top = 100 - floatBottom + "%";
    maskWestRef.current!.style.top = directions.top;
    maskEastRef.current!.style.top = directions.top;
    maskWestRef.current!.style.bottom = directions.bottom;
    maskEastRef.current!.style.bottom = directions.bottom;
  };

  return (
    <cropBoxCtx.Provider
      value={{
        maskEastRef,
        maskNorthRef,
        maskSouthRef,
        maskWestRef,
        dimentions,
        updateMasks,
        setDimentions,
      }}
    >
      {children}
    </cropBoxCtx.Provider>
  );
}
