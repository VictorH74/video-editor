import React from "react";
import { outputVideoCtx } from "@/contexts/outputVideoCtx";

export default function useOutputVideoCtx() {
  const context = React.useContext(outputVideoCtx);
  if (!context) {
    throw new Error("useOutputVideoCtx must be used within a OutputVideoProvider");
  }
  return context;
}
