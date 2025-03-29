import DraggableResizableBox from "../DraggableResizableBox";
import useTextBox, { TextBoxProps } from "./useTextBox";

export default function TextBox(props: TextBoxProps) {
  const { changeDirectionsByIndex, changeContentByIndex, removeBoxByIndex } =
    useTextBox(props);

  return (
    <DraggableResizableBox
      containerRef={props.containerRef}
      directions={props.textBox.directions}
      onDragEnd={changeDirectionsByIndex}
      onDragX={() => {}}
      onDragY={() => {}}
      onResize={() => {}}
      onResizeEnd={changeDirectionsByIndex}
      onRemove={removeBoxByIndex}
    >
      <textarea
        className="text-white p-2 bg-transparent w-full h-full outline-hidden"
        onChange={({ currentTarget: { value } }) => changeContentByIndex(value)}
        value={props.textBox.content}
      />
    </DraggableResizableBox>
  );
}
