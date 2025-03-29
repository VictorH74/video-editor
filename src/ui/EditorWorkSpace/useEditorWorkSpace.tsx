/* eslint-disable react-hooks/exhaustive-deps */
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import { useVideoEditorActions } from "@/hooks/useVideoEditorActions";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import React from "react";

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
    videoResolution,
    videoFile,
  } = useVideoMetadataCtx();
  const {
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
    imageList,
    textList,
  } = useEditorToolsCtx();

  const { computedCommand } = useVideoEditorActions();

  const { setExportedVideoUrl, setProcessingVideo } = useOutputVideoCtx();

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

      computedCommand();

      const formData = new FormData();
      formData.append("file", videoFile);

      const xhr = new XMLHttpRequest();

      xhr.onload = (obj) => {
        if (xhr.status === 200) {
          alert("File uploaded successfully!");
          console.log(obj.target);
        } else {
          alert("File could not be uploaded!");
        }
      };

      xhr.onerror = () => {
        alert("File could not be uploaded!");
      };

      xhr.open("POST", "/api/video-editor");
      xhr.send(formData);
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
