import React from "react";
import useTextBox, { TextBoxProps } from "./useTextBox";
import DraggableResizableBox from "@/components/DraggableResizableBox";

export default function TextBox(props: TextBoxProps) {
  const { changeDirectionsByIndex, changeContentByIndex, removeBoxByIndex, toolAction, setSelectedTextboxRef } =
    useTextBox(props);
  const ref = React.useRef<HTMLTextAreaElement>(null)

  return (
    <DraggableResizableBox
      containerRef={props.containerRef}
      displayBorder={toolAction === "add_text"}
      directions={props.textBox.directions}
      onDragEnd={changeDirectionsByIndex}
      onDragX={() => { }}
      onDragY={() => { }}
      onResize={() => { }}
      onResizeEnd={changeDirectionsByIndex}
      onRemove={removeBoxByIndex}
      minSize={45}
    >
      <textarea
        ref={ref}
        className="text-white p-2 bg-transparent w-full h-full outline-none overflow-hidden resize-none"
        onMouseDown={() => setSelectedTextboxRef(ref)}
        onChange={({ currentTarget: { value } }) => changeContentByIndex(value)}
        value={props.textBox.content}
      />
    </DraggableResizableBox>
  );
}
