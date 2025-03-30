import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CropIcon from "@mui/icons-material/Crop";
import FlipIcon from "@mui/icons-material/Flip";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import SpeedIcon from "@mui/icons-material/Speed";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import React from "react";

export type ToolActionType =
  | "cut_trim"
  | "crop"
  | "rotate"
  | "flip"
  | "volume"
  | "resize"
  | "add_text"
  | "add_image"
  | "speed"
  | undefined;

type ToolType = {
  icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
    muiName: string;
  };
  label: string;
  action: ToolActionType;
  modified: boolean;
};

export default function useEditorTools() {
  const {
    toolAction,
    setToolAction,
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
    imageList,
  } = useEditorToolsCtx();
  const tools = React.useMemo<ToolType[]>(
    () => [
      {
        icon: ContentCutIcon,
        label: "Cortar ou Aparar",
        action: "cut_trim",
        modified: videoStartTime > 0 || videoEndTime < videoDuration!,
      },
      {
        icon: CropIcon,
        label: "Cortar vídeo",
        action: "crop",
        modified:
          Object.values(cropArea)
            .map((v) => parseFloat(v))
            .reduce((total, v) => total + v, 0) > 0,
      },
      {
        icon: RotateLeftIcon,
        label: "Girar",
        action: "rotate",
        modified: !!rotate,
      },
      {
        icon: FlipIcon,
        label: "Inverter",
        action: "flip",
        modified: flipH || flipV,
      },
      {
        icon: VolumeUpIcon,
        label: "Volume",
        action: "volume",
        modified: volume < 100,
      },
      {
        icon: SpeedIcon,
        label: "Velocidade",
        action: "speed",
        modified: speed < 100 || speed > 100,
      },
      {
        icon: AspectRatioIcon,
        label: "Redimensionar",
        action: "resize",
        modified: !!finalResolution,
      },
      {
        icon: TextIncreaseIcon,
        label: "Add Texto",
        action: "add_text",
        modified: textList.length > 0,
      },
      {
        icon: AddPhotoAlternateIcon,
        label: "Add Imagem",
        action: "add_image",
        modified: imageList.length > 0,
      },
    ],
    [
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
      imageList,
    ]
  );

  return { tools, toolAction, setToolAction };
}
