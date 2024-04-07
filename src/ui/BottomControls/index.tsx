import React from "react";
import {
  AddImage,
  AddText,
  Crop,
  Flip,
  Resize,
  Rotate,
  Speed,
  Trim,
  Volume,
} from "./actions";
import { ToolActionType } from "../EditorTools/useEditorTools";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";

const components: Record<
  Exclude<ToolActionType, undefined>,
  React.ReactElement
> = {
  add_image: <AddImage />,
  add_text: <AddText />,
  crop: <Crop />,
  flip: <Flip />,
  resize: <Resize />,
  rotate: <Rotate />,
  speed: <Speed />,
  cut_trim: <Trim />,
  volume: <Volume />,
};

export default function BottomControls() {
  const { toolAction } = useEditorToolsCtx();

  if (!toolAction) return null;
  return components[toolAction];
}
