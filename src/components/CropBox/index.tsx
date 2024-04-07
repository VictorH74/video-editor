import React from "react";
import DraggableResizableBox from "../DraggableResizableBox";
import useCropBox from "./useCropBox";

export default function CropBox() {
  const {
    maskWestRef,
    maskNorthRef,
    maskEastRef,
    maskSouthRef,
    cropArea,
    setCropArea,
    moveMaskByDirection,
    updateMasks,
    setDimentions,
    containerRef,
    toolAction
  } = useCropBox();

  return (
    <div ref={containerRef} className="absolute inset-0 select-none">
    <DraggableResizableBox
    displayBorder={toolAction === "crop"}
    containerRef={containerRef}
      setup={(d, containerD, resizableD) => {
        updateMasks(d);
        setDimentions([containerD, resizableD]);
      }}
      masks={
        <>
          <div ref={maskWestRef} className="absolute left-0 bg-[#00000094]" />
          <div
            ref={maskNorthRef}
            className="absolute top-0 inset-x-0 bg-[#00000094]"
          />
          <div ref={maskEastRef} className="absolute right-0 bg-[#00000094]" />
          <div
            ref={maskSouthRef}
            className="absolute bottom-0 inset-x-0 bg-[#00000094]"
          />
        </>
      }
      directions={cropArea}
      onLeftLimit={() => {
        maskWestRef.current!.style.right = "100%";
      }}
      onTopLimit={() => {
        maskNorthRef.current!.style.bottom = "100%";
      }}
      onRightLimit={() => {
        maskEastRef.current!.style.left = "100%";
      }}
      onBottomLimit={() => {
        maskSouthRef.current!.style.top = "100%";
      }}
      onResize={moveMaskByDirection}
      onResizeEnd={(values, containerD, resizableD) => {
        setCropArea(values);
        setDimentions([containerD, resizableD]);
      }}
      onDragX={(values, containerDimentions) => {
        moveMaskByDirection("left", values[0], containerDimentions);
        moveMaskByDirection("right", values[1], containerDimentions);
      }}
      onDragY={(values, containerDimentions) => {
        moveMaskByDirection("top", values[0], containerDimentions);
        moveMaskByDirection("bottom", values[1], containerDimentions);
      }}
      onDragEnd={(values, containerD, draggableD) => {
        setCropArea(values);
        setDimentions([containerD, draggableD]);
      }}
    />
    </div>
  );
}
