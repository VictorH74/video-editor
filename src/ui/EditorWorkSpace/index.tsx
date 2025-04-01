"use client";
import { ClearBtn, IconButton } from "@/components/buttons";
import CropBox from "@/components/CropBox";
import TextBox from "@/components/TextBox";
import EditorTools from "@/ui/EditorTools";
import { bgColor } from "@/utils/constants";
import { formatTime } from "@/utils/functions";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SettingsIcon from "@mui/icons-material/Settings";
import React from "react";
import { twMerge } from "tailwind-merge";

import VideoPlaybackControl from "../VideoPlaybackControl";
import useEditorWorkSpace from "./useEditorWorkSpace";
import BottomControls from "../BottomControls";

export default function EditorWorkSpace() {
  const {
    videoRef,
    paused,
    videoCurrentTime,
    setPaused,
    saveVideo,
    flipH,
    flipV,
    cutAction,
    // toolAction,
    videoDuration,
    videoStartTime,
    videoEndTime,
    setVideoDuration,
    videoName,
    setVideoResolution,
    textList,
    textBoxContainerRef,
  } = useEditorWorkSpace();

  return (
    <div className={twMerge(`h-screen`, `bg-[${bgColor}]`)}>
      <div id="video-editor" className=" grid place-items-center px-12">
        <div className="relative w-full p-4 flex justify-center mt-7">
          <EditorTools />
          <ClearBtn />
        </div>

        <h2 className="text-gray-700 text-lg">{videoName}</h2>

        <div className="relative shadow-xl max-h-[720px] w-full grid place-items-center">
          <div className="size-fit relative">
            <video
              // width="1280"
              // height="720"
              className="h-full max-h-[720px] w-auto"
              style={{
                scale: `${flipH ? -1 : 1} ${flipV ? -1 : 1}`,
              }}
              ref={videoRef}
              onTimeUpdate={(e) => {
                if (!videoRef || !videoRef.current) return;
                const trim = cutAction === "trim";
                const value = Number(e.currentTarget.currentTime.toFixed(2));
                const start = Number(videoStartTime.toFixed(2));
                const end = videoEndTime;

                if (!trim && value > start && value < end)
                  return (videoRef.current.currentTime = end);

                if ((trim && value < start) || (trim && value > end))
                  return (videoRef.current.currentTime = start);
              }}
              onLoadedMetadata={(e) => {
                setVideoDuration(e.currentTarget.duration);
                setVideoResolution({
                  w: e.currentTarget.videoWidth,
                  h: e.currentTarget.videoHeight,
                });
              }}
            >
              <source type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
            <CropBox />
            {/* {toolAction === "crop" && <CropBox />} */}
          </div>
        </div>

        <h3 className="text-xl text-gray-700 mt-2 mb-4">
          {formatTime(videoCurrentTime)}
        </h3>

        <VideoPlaybackControl
          value={videoRef?.current?.currentTime || 0}
          videoDuration={videoDuration || 0}
          trimCutValue={cutAction}
          onChange={(e) => {
            if (!videoRef || !videoRef.current) return;
            videoRef.current.currentTime = Number(e.currentTarget.value) / 1000;
          }}
        />

        <div className="w-full mt-14 flex gap-4">
          <div className="flex gap-4 flex-1">
            <IconButton
              className="px-7"
              icon={paused ? PlayArrowIcon : PauseIcon}
              rounded
              onClick={() => {
                setPaused(!paused);
              }}
            />
            <BottomControls />
          </div>

          <div className="flex gap-2">
            <IconButton icon={SettingsIcon} rounded onClick={() => {}} />
            <button
              onClick={saveVideo}
              className={twMerge(
                "hover:brightness-105 duration-200 text-gray-800 py-2 px-6 rounded-lg font-medium",
                `bg-[#86B6F6]`
              )}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
