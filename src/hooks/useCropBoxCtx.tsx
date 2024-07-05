import { cropBoxCtx } from "@/contexts/cropBoxCtx";
import React from "react";

export default function useCropBoxCtx() {
  const context = React.useContext(cropBoxCtx);
  if (!context) {
    throw new Error(
      "cropBoxCtx must be used within a CropBoxProvider"
    );
  }
  return context;
}
