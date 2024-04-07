/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import useDraggableResizableBox, {
  DraggableResizableBoxProps,
} from "./useDraggableResizableBox";
import { HandlerType } from "@/types";
import { twMerge } from "tailwind-merge";

export default function DraggableResizableBox(
  props: DraggableResizableBoxProps
) {
  const {
    handleResizeStart,
    handleDragStart,
    onDraggableMove,
    handleDragEnd,
    resizableRef,
  } = useDraggableResizableBox(props);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.log("ResizableBox");
  });

  return (
    <>
      {props.masks && props.masks}

      <div
        ref={resizableRef}
        style={{
          opacity: props.displayBorder ? "1" : "0",
          pointerEvents: props.displayBorder ? "all" : "none",
          ...props.directions,
        }}
        className={twMerge(
          "border-2 border-slate-400 absolute cursor-grab text-wrap p"
        )}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={onDraggableMove}
      >
        {[
          {
            direction: "nw",
            classStr: "-translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
          },
          {
            direction: "n",
            classStr:
              "left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
          },
          {
            direction: "ne",
            classStr: `right-0 translate-x-1/2 -translate-y-1/2 ${
              props.onRemove ? "cursor-default" : "cursor-nesw-resize"
            } `,
          },
          {
            direction: "e",
            classStr:
              "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
          },
          {
            direction: "se",
            classStr:
              "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
          },
          {
            direction: "s",
            classStr:
              "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize",
          },
          {
            direction: "sw",
            classStr:
              "bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
          },
          {
            direction: "w",
            classStr:
              "top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize",
          },
        ].map(({ direction, classStr }) => (
          <span
            key={direction}
            onMouseDown={(e) =>
              props.onRemove && direction === "ne"
                ? props.onRemove()
                : handleResizeStart(e, direction as HandlerType)
            }
            className={`${
              props.onRemove && direction === "ne"
                ? "bg-red-500"
                : "bg-orange-400"
            }  w-3 h-3 rounded-full absolute ${classStr}`}
          />
        ))}
        {props.children}
      </div>
    </>
    // </div>
  );
}
