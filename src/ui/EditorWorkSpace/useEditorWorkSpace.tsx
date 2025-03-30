/* eslint-disable react-hooks/exhaustive-deps */
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import React from "react";
import { createWriteStream } from "streamsaver";

export default function useEditorWorkSpace() {
  // performance.now();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const textBoxContainerRef = React.useRef<HTMLDivElement>(null);
  const [showPlayBtn, setShowPlayBtn] = React.useState(false);
  const [paused, setPaused] = React.useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = React.useState(0);

  const {
    videoName,
    setVideoResolution,
    videoUrl,
    videoFile,
    videoResolution,
  } = useVideoMetadataCtx();
  const {
    flipH,
    flipV,
    cutAction,
    toolAction,
    cropArea,
    videoDuration,
    videoStartTime,
    videoEndTime,
    setVideoDuration,
    volume,
    speed,
    imageList,
    finalResolution,
    textList,
    changed,
  } = useEditorToolsCtx();

  const { setProcessingVideo } = useOutputVideoCtx();

  React.useEffect(() => {
    if (!videoRef || !videoRef.current || !videoUrl) return;

    videoRef.current.src = videoUrl;

    requestAnimationFrame(updateVideoTime);
  }, []);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = videoStartTime;
  }, [videoStartTime]);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = videoEndTime;
  }, [videoEndTime]);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume / 100;
  }, [volume]);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed / 100;
  }, [speed]);

  React.useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    if (paused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [paused]);

  const generateStrCommand = () => {
    const execCommand: string[] = []; // -> "trim=00-00-5.247:00-00-13.8_crop=733.4995199999998:1080:531.74976:0_scale=-1:1080_transpose=1_hflip_vflip_speed=4";

    // trim / cut
    if (changed.videoStartEndTime) {
      switch (cutAction) {
        case "cut":
          // 5.47,10
          // execCommand.push(`cut=5.47:10`);
          execCommand.push(`cut=${videoStartTime}:${videoEndTime}`);
          break;
        case "trim":
          execCommand.push(
            `trim=${videoStartTime}:${videoEndTime - videoStartTime}`
          );
          break;
      }
    }

    // crop
    if (changed.cropArea) execCommand.push(getCropFilter());

    // resize
    if (changed.resize) execCommand.push(`scale=-1:${finalResolution}`);

    // flip
    if (flipH) execCommand.push("hflip");
    if (flipV) execCommand.push("vflip");

    // speed
    if (changed.speed) execCommand.push(`speed=${speed / 100}`);

    return execCommand.join("_");
  };

  const getCropFilter = () => {
    const [left, top, right, bottom] = Object.values(cropArea).map((v) =>
      parseFloat(v)
    );

    const videoWidth = videoResolution!.w;
    const videoHeight = videoResolution!.h;

    const w =
      videoWidth - ((left / 100) * videoWidth + (right / 100) * videoWidth);
    const h =
      videoHeight - ((top / 100) * videoHeight + (bottom / 100) * videoHeight);
    const x = (left / 100) * videoWidth;
    const y = (top / 100) * videoHeight;

    return `crop=${w}:${h}:${x}:${y}`;
  };

  function updateVideoTime() {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }

    requestAnimationFrame(updateVideoTime);
  }

  const saveVideo = async () => {
    if (!videoFile) return;

    try {
      // setProcessingVideo(true);
      // const newUrl = await processVideo();
      // setExportedVideoUrl(newUrl);

      const simpleComplexFilterStr = generateStrCommand();

      console.log(simpleComplexFilterStr);

      // const simpleComplexFilterStr =
      //   "trim=00-00-5.247:00-00-13.8_scale=-1:1080";

      const formData = new FormData();
      formData.append("simpleComplexFilterStr", simpleComplexFilterStr);
      formData.append("file", videoFile);

      const response = await fetch("/api/video-editor", {
        method: "POST",
        body: formData,
      });

      if (!response.body) {
        console.error("No response body");
        return;
      }

      const readerInstance = response.body.getReader();
      const decoder = new TextDecoder();

      const fileStream = createWriteStream("processed-video.mp4"); // TODO: dinamic extencion
      const writer = fileStream.getWriter();

      let _done = false;
      let doneObj = false;

      while (!_done) {
        const { value, done } = await readerInstance.read();
        _done = done;

        if (done) {
          writer.close();
          console.log("OOKKK");
        }

        const valueStr = decoder.decode(value, { stream: true });

        if (!doneObj) {
          try {
            const obj = JSON.parse(valueStr);

            if (obj.progress) {
              console.log(obj.progress);
              if (obj.progress === 100) {
                doneObj = true;
                console.log("progress done!");
              }
            }
          } catch (_err) {
            doneObj = true;
          }
        }

        if (doneObj && value) {
          await writer.write(value);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingVideo(false);
    }
  };

  return {
    paused,
    videoRef,
    showPlayBtn,
    videoCurrentTime,
    setShowPlayBtn,
    setPaused,
    saveVideo,
    videoName,
    textList,
    imageList,
    setVideoResolution,
    flipH,
    flipV,
    cutAction,
    toolAction,
    videoDuration,
    videoStartTime,
    videoEndTime,
    setVideoDuration,
    volume,
    speed,
    textBoxContainerRef,
  };
}
