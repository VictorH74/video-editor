// import React from "react";
import DraggableResizableBox from "@/components/DraggableResizableBox";
import useImageBox, { ImageBoxProps } from "./useImageBox";

export default function ImageBox(props: ImageBoxProps) {
  const { changeDirectionsByIndex, removeBoxByIndex, toolAction } =
    useImageBox(props);

  return (
    <DraggableResizableBox
      containerRef={props.containerRef}
      displayBorder={toolAction === "add_image"}
      directions={props.imageBox.directions}
      onDragEnd={changeDirectionsByIndex}
      onDragX={() => { }}
      onDragY={() => { }}
      onResize={() => { }}
      onResizeEnd={changeDirectionsByIndex}
      onRemove={removeBoxByIndex}
      minSize={100}

    >
      <img
        style={{
          maxHeight: props.containerRef.current!.getBoundingClientRect().height
        }}
        className="h-full w-full pointer-events-none select-none"
        src={props.imageBox.src} />
    </DraggableResizableBox>
  );
}
