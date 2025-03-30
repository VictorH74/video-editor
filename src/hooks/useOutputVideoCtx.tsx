import { outputVideoCtx } from "@/contexts/outputVideoCtx";
import React from "react";

export default function useOutputVideoCtx() {
  const context = React.use(outputVideoCtx);
  if (!context) {
    throw new Error(
      "useOutputVideoCtx must be used within a OutputVideoProvider"
    );
  }
  return context;
}
