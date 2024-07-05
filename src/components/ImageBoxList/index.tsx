import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import React from "react";
import ImageBox from "./components/ImageBox";

export default function ImageBoxList() {
    const imageBoxContainerRef = React.useRef<HTMLDivElement>(null);
    const { imageList } = useEditorToolsCtx();

    React.useEffect(() => {
        if (imageList.length === 0 && imageBoxContainerRef.current)
            imageBoxContainerRef.current.style.pointerEvents = "none"
    }, [imageList])

    return (
        <div className="absolute inset-0" ref={imageBoxContainerRef}>
            {imageList.map((img, i) => (
                <ImageBox
                    containerRef={imageBoxContainerRef}
                    key={i}
                    index={i}
                    imageBox={img}
                />
            ))}
        </div>
    )
}