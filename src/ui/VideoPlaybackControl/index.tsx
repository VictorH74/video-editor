import FrameList from "@/components/FrameList";
import PlaybackControlTrack from "@/components/PlaybackControlTrack";
import { formatTime } from "@/utils/functions";
import React from "react";

import useVideoPlaybackControl, {
  frameHeight,
  frameWidth,
} from "./useVideoPlaybackControl";

interface Props {
  videoDuration: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  trimCutValue: "trim" | "cut";
}

export default function VideoPlaybackControl(props: Props) {
  const {
    playbackControlContainerRef,
    playbackControlRef,
    shadowThumbRef,
    shadowThumbValueRef,
    videoStartTimeRef,
    videoEndTimeRef,
    mouseMoveTarget,
    videoStartSectionRef,
    videoCutSectionRef,
    videoEndSectionRef,
    frames,
    showTimeIndicator,
    toggleShowIndicator,
    videoStartTimeHandleMouseDown,
    videoEndTimeHandleMouseDown,
    setMouseMoveTarget,
    handleMouseMove,
    videoStartTime,
    videoEndTime,
  } = useVideoPlaybackControl();

  const trim = props.trimCutValue === "trim";

  return (
    <div
      ref={playbackControlContainerRef}
      className="relative h-[58px] w-full select-none"
      onMouseMove={handleMouseMove}
    >
      {/* <span className="absolute">{props.value}</span> */}

      {Array(2)
        .fill(undefined)
        .map((_, i) => (
          <div
            key={i}
            className={`absolute top-0 bottom-0 w-2 hover:brightness-110 bg-[#176B87] z-50 flex flex-col justify-center items-center gap-1 ${
              i === 1 && "right-0"
            }`}
            style={{
              translate: trim ? (i === 0 ? "-8px" : "8px") : "0",
              borderRadius: trim
                ? i === 0
                  ? "5px 0 0 5px"
                  : "0 5px 5px 0"
                : i === 0
                ? "0 5px 5px 0"
                : "5px 0 0 5px",
            }}
            ref={i === 0 ? videoStartTimeRef : videoEndTimeRef}
            onMouseDown={
              i === 0
                ? videoStartTimeHandleMouseDown
                : videoEndTimeHandleMouseDown
            }
            onMouseOver={() => {
              document.body.style.cursor = "ew-resize";
            }}
            onMouseLeave={() => {
              if (mouseMoveTarget) return;
              document.body.style.cursor = "default";
            }}
          >
            <span className="absolute -bottom-7 text-sky-400">
              {formatTime(i === 0 ? videoStartTime : videoEndTime)}
            </span>
            {Array(3)
              .fill(undefined)
              .map((_, i) => (
                <div key={i} className="size-1 rounded-full bg-white"></div>
              ))}
          </div>
        ))}

      <PlaybackControlTrack
        sectionRef={videoStartSectionRef}
        className="left-0"
        show={trim}
      />
      <PlaybackControlTrack
        sectionRef={videoCutSectionRef}
        className="inset-x-0"
        show={!trim}
      />
      <PlaybackControlTrack
        sectionRef={videoEndSectionRef}
        className="right-0"
        show={trim}
      />

      <input
        ref={playbackControlRef}
        type="range"
        min={0}
        max={props.videoDuration * 1000}
        value={props.value * 1000}
        onChange={props.onChange}
        onMouseOver={toggleShowIndicator}
        onMouseLeave={toggleShowIndicator}
        onClick={() => {
          setMouseMoveTarget("rangeinput");
        }}
        className="slider rounded-lg bg-transparent absolute inset-0 borçder-2 appearance-none overflow-hidden"
        id="myRange"
      />
      <div
        style={{ display: showTimeIndicator ? "grid" : "none" }}
        ref={shadowThumbRef}
        className="absolute bg-orange-400 w-[1px] h-full pointer-events-none"
      >
        <span
          ref={shadowThumbValueRef}
          className="absolute -top-7 -translate-x-1/2 text-orange-300"
        >
          -
        </span>
      </div>

      <FrameList
        frames={frames}
        frameHeight={frameHeight}
        frameWidth={frameWidth}
      />
    </div>
  );
}
