/* eslint-disable @typescript-eslint/ban-types */
import ContentCutIcon from "@mui/icons-material/ContentCut";
import CropIcon from "@mui/icons-material/Crop";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import FlipIcon from "@mui/icons-material/Flip";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import TextIncreaseIcon from "@mui/icons-material/TextIncrease";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SpeedIcon from "@mui/icons-material/Speed";
import React from "react";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";

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
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
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
    changed
  } = useEditorToolsCtx();
  const tools = React.useMemo<ToolType[]>(
    () => [
      {
        icon: ContentCutIcon,
        label: "Cortar ou Aparar",
        action: "cut_trim",
        modified: changed.videoStartEndTime,
      },
      {
        icon: CropIcon,
        label: "Cortar vídeo",
        action: "crop",
        modified: changed.cropArea,
      },
      {
        icon: RotateLeftIcon,
        label: "Girar",
        action: "rotate",
        modified: changed.rotate,
      },
      {
        icon: FlipIcon,
        label: "Inverter",
        action: "flip",
        modified: changed.flip,
      },
      {
        icon: VolumeUpIcon,
        label: "Volume",
        action: "volume",
        modified: changed.volume,
      },
      {
        icon: SpeedIcon,
        label: "Velocidade",
        action: "speed",
        modified: changed.speed,
      },
      {
        icon: AspectRatioIcon,
        label: "Redimensionar",
        action: "resize",
        modified: changed.resize,
      },
      {
        icon: TextIncreaseIcon,
        label: "Add Texto",
        action: "add_text",
        modified: changed.addText,
      },
      {
        icon: AddPhotoAlternateIcon,
        label: "Add Imagem",
        action: "add_image",
        modified: changed.addImg,
      },
    ],
    [changed]
  );

  return { tools, toolAction, setToolAction };
}
