import React from "react";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import TextBox from "./components/TextBox";

export default function TextboxList() {
    const textBoxContainerRef = React.useRef<HTMLDivElement>(null);
    const { textList } = useEditorToolsCtx();

    React.useEffect(() => {
        if (textList.length === 0 && textBoxContainerRef.current)
            textBoxContainerRef.current.style.pointerEvents = "none"
    }, [textList])

    return (
        <div className="absolute inset-0" ref={textBoxContainerRef}>
            {textList.map((t, i) => (
                <TextBox
                    containerRef={textBoxContainerRef}
                    key={i}
                    index={i}
                    textBox={t}
                />
            ))}
        </div>
    )
}