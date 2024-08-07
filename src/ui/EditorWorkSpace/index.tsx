/* eslint-disable react-hooks/exhaustive-deps */
import VideoPlaybackControl from "../VideoPlaybackControl";
import { formatTime } from "@/utils/functions";
import EditorTools from "@/ui/EditorTools";
import useEditorWorkSpace from "./useEditorWorkSpace";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SettingsIcon from "@mui/icons-material/Settings";
import BottomControls from "../BottomControls";
import { ClearBtn, IconButton } from "@/components/buttons";
import CropBox from "@/components/CropBox";
import { twMerge } from "tailwind-merge";
import { bgColor } from "@/utils/constants";
import ImageBoxList from "@/components/ImageBoxList";
import TextboxList from "@/components/TextBoxList";

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
    videoDuration,
    videoStartTime,
    videoEndTime,
    setVideoDuration,
    videoName,
    setVideoResolution,
  } = useEditorWorkSpace();

  return (
    <div className={twMerge(`h-screen`, `bg-[${bgColor}]`)}>
      <div id="video-editor" className=" grid place-items-center px-12">
        <div className="relative w-full p-4 flex justify-center mt-7">
          <EditorTools />
          <ClearBtn />
        </div>

        <h2 className="text-gray-700 text-lg">{videoName}</h2>

        <div className="relative shadow-xl">
          <video
            width="1280"
            height="720"
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

          <TextboxList />

          <ImageBoxList />
          
          <CropBox />
          
          {/* {toolAction === "crop" && <CropBox />} */}
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
              className={twMerge("hover:brightness-105 duration-200 text-gray-800 py-2 px-6 rounded-lg font-medium", `bg-[#86B6F6]`)}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
