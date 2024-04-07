/* eslint-disable react-hooks/exhaustive-deps */
import useWindowSize from "@/hooks/useWindowSize";
import { formatTime } from "@/utils/functions";
import React from "react";
import useEditorToolsCtx from "@/hooks/useEditorToolsCtx";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";

export const frameHeight = 60;
export const frameWidth = 98;

type MoveTarget =
  | undefined
  | "selectpartSTART"
  | "selectpartEND"
  | "rangeinput";

export default function useVideoPlaybackControl() {
  const [frames, setFrames] = React.useState<string[]>([]);

  const [width] = useWindowSize();
  const debouncedFunction = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const playbackControlContainerRef = React.useRef<HTMLInputElement>(null);
  const playbackControlRef = React.useRef<HTMLInputElement>(null);
  const shadowThumbRef = React.useRef<HTMLInputElement>(null);
  const shadowThumbValueRef = React.useRef<HTMLInputElement>(null);

  const videoStartTimeRef = React.useRef<HTMLDivElement>(null);
  const videoEndTimeRef = React.useRef<HTMLDivElement>(null);

  const videoStartSectionRef = React.useRef<HTMLDivElement>(null);
  const videoCutSectionRef = React.useRef<HTMLDivElement>(null);
  const videoEndSectionRef = React.useRef<HTMLDivElement>(null);

  const [showTimeIndicator, setShowIndicator] = React.useState(false);

  const [mouseMoveTarget, setMouseMoveTarget] = React.useState<MoveTarget>();

  const {
    videoStartTime,
    videoEndTime,
    setVideoStartTime,
    setVideoEndTime,
    videoDuration,
  } = useEditorToolsCtx();
  const { videoUrl } = useVideoMetadataCtx();

  React.useEffect(() => {
    // document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  React.useEffect(() => {
    setShowIndicator(mouseMoveTarget === "rangeinput");
  }, [mouseMoveTarget]);

  React.useEffect(() => {
    const debounce = (func: () => void, delay: number) => {
      if (debouncedFunction.current) {
        clearTimeout(debouncedFunction.current);
      }

      debouncedFunction.current = setTimeout(func, delay);
    };

    debounce(generateFrames, 300);
  }, [width]);

  const generateFrames = async () => {
    if (!videoUrl) return;
    const video = document.createElement("video");
    video.src = videoUrl;

    await video.load();
    await new Promise((resolve) => (video.onloadedmetadata = resolve));
    const videoDuration = video.duration;

    if (!playbackControlContainerRef.current) return;

    // quantidade de frames a ser renderizados
    let frameAmount = Math.ceil(
      (playbackControlContainerRef.current.offsetWidth + frameWidth) /
        frameWidth
    );

    // distancia de tempo entre os frames
    const avarage = videoDuration / frameAmount;

    // array de tempo atual de cada frame (primeiro frame no tempo: 0)
    let frameTimes = [0];

    for (let time = avarage; time <= videoDuration; time += avarage) {
      frameTimes.push(time);
    }
    frameTimes.push(videoDuration);

    const canvas = document.createElement("canvas");
    canvas.width = frameWidth;
    canvas.height = frameHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    let frameUrls = [];

    for (const frameTime of frameTimes) {
      video.currentTime = frameTime;

      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      frameUrls.push(canvas.toDataURL("image/png"));
    }

    setFrames(frameUrls);
  };

  const handleMouseUp = React.useCallback(() => {
    if (mouseMoveTarget === "rangeinput") return;
    document.body.style.cursor = "default";
    setMouseMoveTarget(undefined);
  }, [mouseMoveTarget]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseMoveTarget) return;
    if (!playbackControlRef.current) return;

    const playbackControl = playbackControlRef.current;
    const rect = playbackControl.getBoundingClientRect();
    const width = rect.right - rect.left; // Largura do elemento

    const [leftDistance, rightDistance] = [
      e.clientX - rect.left,
      (e.clientX - rect.right) * -1,
    ];

    const playbackControlValue =
      (leftDistance / width) * (Number(playbackControl.max) / 1000);

    const moveSelectPart = (
      target: MoveTarget,
      ref: React.RefObject<HTMLDivElement>,
      ref2: React.RefObject<HTMLDivElement>,
      ref3: React.RefObject<HTMLDivElement>,
      abortCondition: boolean,
      cb: (ref: React.RefObject<HTMLDivElement>) => void
    ) => {
      if (
        mouseMoveTarget === target &&
        ref.current &&
        ref2.current &&
        ref3.current
      ) {
        if (abortCondition) return true;

        cb(ref);
        ref2.current.style.right = (rightDistance / width) * 100 + "%";
        ref3.current.style.left = (leftDistance / width) * 100 + "%";

        return true;
      }
      return false;
    };

    // select part START div moviment
    if (
      moveSelectPart(
        "selectpartSTART",
        videoStartTimeRef,
        videoStartSectionRef,
        videoCutSectionRef,
        playbackControlValue >= videoEndTime || playbackControlValue < 0,
        (ref) => {
          if (ref.current) {
            setVideoStartTime(playbackControlValue);
            ref.current.style.left = `${(leftDistance / width) * 100}%`;
            // setLeftM(leftDistance / width * 100)
          }
        }
      )
    )
      return;

    // select part END div moviment
    if (
      moveSelectPart(
        "selectpartEND",
        videoEndTimeRef,
        videoCutSectionRef,
        videoEndSectionRef,
        playbackControlValue <= videoStartTime ||
          playbackControlValue > (videoDuration || 0),
        (ref) => {
          if (ref.current) {
            setVideoEndTime(playbackControlValue);
            ref.current.style.right = `${(rightDistance / width) * 100}%`;
            // setRightM(rightDistance / width * 100)
          }
        }
      )
    )
      return;

    if (!shadowThumbRef || !shadowThumbRef.current) return;
    if (!shadowThumbValueRef || !shadowThumbValueRef.current) return;

    shadowThumbRef.current.style.left = `${leftDistance}px`;
    shadowThumbValueRef.current.textContent = formatTime(playbackControlValue);
  };

  const toggleShowIndicator = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (e.type === "mouseleave" && mouseMoveTarget === "rangeinput") {
      setMouseMoveTarget(undefined);
    } else if (e.type === "mouseover" && !mouseMoveTarget) {
      setMouseMoveTarget("rangeinput");
    }
  };

  const handleMouseDown = (
    setter: (v: number) => void,
    target: MoveTarget,
    mouseXPos: number
  ) => {
    if (!playbackControlRef || !playbackControlRef.current) return;

    const playbackControl = playbackControlRef.current;
    const rect = playbackControl.getBoundingClientRect();
    const width = rect.right - rect.left; // Largura do elemento
    const leftDistance = mouseXPos - rect.left;

    let value = (leftDistance / width) * (Number(playbackControl.max) / 1000);

    if (value < 0) value = 0;
    if (videoDuration && value > videoDuration) value = videoDuration;

    setter(value);
    setMouseMoveTarget(target);
  };

  const videoStartTimeHandleMouseDown = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => handleMouseDown(setVideoStartTime, "selectpartSTART", e.clientX);

  const videoEndTimeHandleMouseDown = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => handleMouseDown(setVideoEndTime, "selectpartEND", e.clientX);

  return {
    playbackControlContainerRef,
    playbackControlRef,
    videoStartTimeRef,
    videoEndTimeRef,
    mouseMoveTarget,
    videoStartSectionRef,
    videoCutSectionRef,
    videoEndSectionRef,
    frames,
    shadowThumbRef,
    showTimeIndicator,
    shadowThumbValueRef,
    handleMouseMove,
    setMouseMoveTarget,
    toggleShowIndicator,
    videoStartTimeHandleMouseDown,
    videoEndTimeHandleMouseDown,
    videoStartTime,
    videoEndTime,
  };
}
