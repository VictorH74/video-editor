/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import React from "react";

export default function useEditorWorkSpace() {
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

  const {
    setProcessingVideo,
    setProgress,
    creatingVideoUrl,
    setCreatingVideoUrl,
    setExportedVideoUrl,
  } = useOutputVideoCtx();

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

  async function uploadVideo(file: File, simpleComplexFilterStr: string) {
    const chunkSize = 3 * 1024 * 1024; // 3MB por chunk

    const stream = new ReadableStream({
      start(controller) {
        const reader = file.stream().getReader();

        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            // Divide os chunks conforme necessário
            for (let i = 0; i < value.length; i += chunkSize) {
              controller.enqueue(value.slice(i, i + chunkSize));
            }

            push();
          });
        }

        push();
      },
    });

    const request = new Request(
      `/api/video-editor?simpleComplexFilterStr=${encodeURIComponent(
        simpleComplexFilterStr
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          fileType: file.type,
        },
        body: stream,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...((fetch as any) && { duplex: "half" }),
      }
    );

    return fetch(request);
  }

  // async function uploadVideoToFirebase(file: File) {
  //   const storage = getStorage();
  //   const storageRef = ref(storage, `vheditor-uploads/${file.name}`);
  //   const snap = await uploadBytes(storageRef, file, {
  //     contentType: file.type,
  //   });

  //   return getDownloadURL(snap.ref);
  // }

  const saveVideo = async () => {
    if (!videoFile) return;

    try {
      setProcessingVideo(true);

      const simpleComplexFilterStr = generateStrCommand();

      console.log(simpleComplexFilterStr);

      let response: Response;

      if (process.env.NODE_ENV == "production") {
        response = await uploadVideo(videoFile, simpleComplexFilterStr);
      } else {
        const formData = new FormData();
        formData.append("file", videoFile);

        response = await fetch(
          `/api/video-editor?simpleComplexFilterStr=${encodeURIComponent(
            simpleComplexFilterStr
          )}`,
          {
            method: "POST",
            body: formData,
            headers: {
              fileType: videoFile.type,
            },
          }
        );
      }

      if (!response.body) {
        console.error("No response body");
        return;
      }

      const readerInstance = response.body.getReader();
      const decoder = new TextDecoder();

      let _done = false;

      while (!_done) {
        const { value, done } = await readerInstance.read();
        _done = done;

        if (done) {
          console.log("Download complete!");
          return;
        }

        const valueStr = decoder.decode(value, { stream: true });

        const obj = JSON.parse(valueStr);

        if (obj.progress) {
          setProgress(Number(obj.progress));
          console.log(`Progress: ${obj.progress}%`);
          if (obj.progress == 100 && !creatingVideoUrl)
            setCreatingVideoUrl(true);
          continue;
        }
        if (obj.videoUrl) {
          console.log("video url: ", obj.videoUrl);
          setExportedVideoUrl(obj.videoUrl);
          continue;
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
