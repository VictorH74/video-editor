"use client";
import React from "react";
import { ToolActionType } from "@/ui/EditorTools/useEditorTools";
import { ImageBoxType, TextBoxType } from "@/types";

type ChangedType = {
  videoStartEndTime: boolean;
  cropArea: boolean;
  flip: boolean;
  rotate: boolean;
  volume: boolean;
  speed: boolean;
  resize: boolean;
  addText: boolean;
  addImg: boolean;
}

interface Props {
  selectedTextboxRef: React.RefObject<HTMLTextAreaElement>
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
  changed: ChangedType

  // tools
  setSelectedTextboxRef: (ref: React.MutableRefObject<HTMLTextAreaElement | null>) => void
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

export type CropAreaType = {
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

  const selectedTextboxRef = React.useRef<HTMLTextAreaElement | null>(null);

  const changed: ChangedType = React.useMemo<ChangedType>(() => ({
    videoStartEndTime: videoStartTime > 0 || (!!videoDuration && videoEndTime < videoDuration),
    cropArea: Object.values(cropArea)
      .map((v) => parseFloat(v))
      .reduce((total, v) => total + v, 0) > 0,
    flip: flipH || flipV,
    rotate: rotate > 0,
    volume: volume < 100,
    speed: speed < 100 || speed > 100,
    resize: !!finalResolution,
    addText: textList.length > 0,
    addImg: imageList.length > 0
  }), [
    finalResolution,
    cropArea,
    volume,
    speed,
    rotate,
    flipH,
    flipV,
    videoStartTime,
    videoEndTime,
    videoDuration,
    textList,
    imageList
  ])

  React.useEffect(() => {
    if (videoDuration) setVideoEndTime(videoDuration);
  }, [videoDuration]);

  const setSelectedTextboxRef = (ref: React.MutableRefObject<HTMLTextAreaElement | null>) => {
    selectedTextboxRef.current = ref.current
  }

  return (
    <editorToolsCtx.Provider
      value={{
        changed,
        selectedTextboxRef,
        setSelectedTextboxRef,
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
