import DraggableResizableBox from "../DraggableResizableBox";
import useImageBox, { ImageBoxProps } from "./useImageBox";

export default function ImageBox(props: ImageBoxProps) {
  const { changeDirectionsByIndex, removeBoxByIndex } =
    useImageBox(props);

  return (
    <DraggableResizableBox
      containerRef={props.containerRef}
      directions={props.imageBox.directions}
      onDragEnd={changeDirectionsByIndex}
      onDragX={() => {}}
      onDragY={() => {}}
      onResize={() => {}}
      onResizeEnd={changeDirectionsByIndex}
      onRemove={removeBoxByIndex}
    >
      <p>Image</p>
    </DraggableResizableBox>
  );
}