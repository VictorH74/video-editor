"use client";
import React from "react";
import { ToolActionType } from "@/ui/EditorTools/useEditorTools";
import { Directions, ImageBoxType, TextBoxType } from "@/types";

interface Props {
  cutAction: "cut" | "trim";
  cropArea: CropAreaType;
  rotate: 0 | 1 | 2 | 3;
  flipH: boolean;
  flipV: boolean;
  volume: number;
  speed: number;
  finalResolution: number | null;
  textList: TextBoxType[];
  imageList: ImageBoxType[];
  toolAction: ToolActionType;
  videoStartTime: number;
  videoEndTime: number;
  videoDuration: number | undefined;

  // tools
  setCutAction: React.Dispatch<React.SetStateAction<"cut" | "trim">>;
  setCropArea: React.Dispatch<React.SetStateAction<CropAreaType>>;
  setRotate: React.Dispatch<React.SetStateAction<0 | 1 | 2 | 3>>;
  setFlipH: React.Dispatch<React.SetStateAction<boolean>>;
  setFlipV: React.Dispatch<React.SetStateAction<boolean>>;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  setFinalResolution: React.Dispatch<React.SetStateAction<number | null>>;
  setTextList: React.Dispatch<React.SetStateAction<TextBoxType[]>>;
  setImageList: React.Dispatch<React.SetStateAction<ImageBoxType[]>>;
  setToolAction: React.Dispatch<React.SetStateAction<ToolActionType>>;
  setVideoStartTime: React.Dispatch<React.SetStateAction<number>>;
  setVideoEndTime: React.Dispatch<React.SetStateAction<number>>;
  setVideoDuration: React.Dispatch<React.SetStateAction<number | undefined>>;
}

type CropAreaType = {
  left: string;
  top: string;
  right: string;
  bottom: string;
};

export const editorToolsCtx = React.createContext<Props | null>(null);

export default function EditorToolsProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  // actions
  const [cutAction, setCutAction] = React.useState<"cut" | "trim">("trim");
  const [cropArea, setCropArea] = React.useState<CropAreaType>({
    left: "0%",
    top: "0%",
    right: "0%",
    bottom: "0%",
  });
  const [rotate, setRotate] = React.useState<0 | 1 | 2 | 3>(0);
  const [flipH, setFlipH] = React.useState(false);
  const [flipV, setFlipV] = React.useState(false);
  const [volume, setVolume] = React.useState(100);
  const [speed, setSpeed] = React.useState(100);
  const [finalResolution, setFinalResolution] = React.useState<number | null>(
    null
  );
  const [textList, setTextList] = React.useState<TextBoxType[]>([]);
  const [imageList, setImageList] = React.useState<ImageBoxType[]>([]);

  const [toolAction, setToolAction] = React.useState<ToolActionType>();
  const [videoDuration, setVideoDuration] = React.useState<
    number | undefined
  >();
  const [videoStartTime, setVideoStartTime] = React.useState(0);
  const [videoEndTime, setVideoEndTime] = React.useState(0);

  React.useEffect(() => {
    if (videoDuration) setVideoEndTime(videoDuration);
  }, [videoDuration]);

  return (
    <editorToolsCtx.Provider
      value={{
        setVideoDuration,
        setVideoEndTime,
        setVideoStartTime,
        videoEndTime,
        videoStartTime,
        cutAction,
        imageList,
        textList,
        cropArea,
        flipH,
        flipV,
        finalResolution,
        videoDuration,
        rotate,
        setImageList,
        setTextList,
        setCropArea,
        setFlipH,
        setFlipV,
        setFinalResolution,
        setRotate,
        setSpeed,
        setVolume,
        speed,
        volume,
        toolAction,
        setCutAction,
        setToolAction,
      }}
    >
      {children}
    </editorToolsCtx.Provider>
  );
}
