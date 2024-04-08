/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { DimentionType, DirectionType, Directions, HandlerType } from "@/types";
import React from "react";

export interface DraggableResizableBoxProps {
  displayBorder?: boolean
  masks?: React.ReactElement;
  children?: React.ReactElement;
  directions?: Partial<Directions>;
  setDirections?: (directions: Directions) => void;
  childrenRatioAspect?: boolean;
  minSize?: number;
  onRemove?: () => void
  onDragEnd: (
    values: Directions,
    containerDimention: DimentionType,
    draggableDimention: DimentionType
  ) => void;
  onDragX: (
    values: [number, number],
    containerDimention: DimentionType
  ) => void;
  onDragY: (
    values: [number, number],
    containerDimention: DimentionType
  ) => void;
  onResizeEnd: (
    values: Directions,
    containerDimention: DimentionType,
    resisableDimention: DimentionType
  ) => void;
  onResize: (
    direction: DirectionType,
    value: number,
    containerDimention: DimentionType
  ) => void;

  onLeftLimit?: () => void;
  onTopLimit?: () => void;
  onRightLimit?: () => void;
  onBottomLimit?: () => void;
  setup?: (
    directions: Directions,
    containerDimention: DimentionType,
    resisableDimention: DimentionType
  ) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function useDraggableResizableBoxBox(
  props: Omit<DraggableResizableBoxProps, "children">
) {
  const resizableRef = React.useRef<HTMLDivElement>(null);

  const [onResize, setOnResize] = React.useState<HandlerType>();
  const [onDrag, setOnDrag] = React.useState(false);
  const [lastP, setLastP] = React.useState({ left: 0, top: 0 });
  const [prevValues, setPrevValues] = React.useState<
    Record<DirectionType, number>
  >({ bottom: 0, left: 0, right: 0, top: 0 });

  React.useEffect(() => {
    const c = props.containerRef.current!;
    c.onmouseup = handleResizeEnd;
    c.onmouseleave = handleResizeEnd;
    c.onmousemove = (e) => onResizableMove(e);
  }, [onResize]);

  React.useEffect(() => {
    if (props.setup && resizableRef.current) {
      const r = resizableRef.current!;
      const c = props.containerRef.current!;
      const { width: cWidth, height: cHeight } = c.getBoundingClientRect();
      const { width: rWidth, height: rHeight } = r.getBoundingClientRect();

      const { left, top, right, bottom } = r.style;
      props.setup(
        { left, top, right, bottom },
        [cWidth, cHeight],
        [rWidth, rHeight]
      );
    }
  }, []);

  const resize = (direction: DirectionType, mouseP: number) => {
    const r = resizableRef.current!;
    const isYAxis = ["top", "bottom"].includes(direction);
    const cRect = props.containerRef.current!.getBoundingClientRect();
    const measure = cRect[isYAxis ? "height" : "width"];

    let distance = mouseP - (isYAxis ? cRect.top : cRect[direction]);

    if (direction === "right") distance *= -1;

    const isBottom = direction === "bottom";
    const newValue = isBottom ? measure - distance : distance;
    const newValuePercent = (newValue / measure) * 100;

    const minDimension = props.minSize || 0;
    if (
      r[isYAxis ? "offsetHeight" : "offsetWidth"] < minDimension &&
      newValuePercent > prevValues[direction]
    )
      return;

    setPrevValues((oldValues) => ({
      ...oldValues,
      [direction]: newValuePercent,
    }));

    if (newValuePercent < 0) return (r.style[direction] = "0%");

    r.style[direction] = newValuePercent + "%";
    props.onResize(direction, newValue, [cRect.width, cRect.height]);
    // moveMaskByDirection(direction, newValue);
  };

  const resizeDirection = (
    mouseP: [number, number] // [x, y]
  ): Record<Exclude<HandlerType, undefined>, () => void> => ({
    sw: () => {
      resize("left", mouseP[0]);
      resize("bottom", mouseP[1]);
    },
    se: () => {
      resize("right", mouseP[0]);
      resize("bottom", mouseP[1]);
    },
    nw: () => {
      resize("left", mouseP[0]);
      resize("top", mouseP[1]);
    },
    ne: () => {
      resize("right", mouseP[0]);
      resize("top", mouseP[1]);
    },
    w: () => resize("left", mouseP[0]),
    e: () => resize("right", mouseP[0]),
    n: () => resize("top", mouseP[1]),
    s: () => resize("bottom", mouseP[1]),
  });

  const handleResizeStart = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    direction: HandlerType
  ) => {
    e.stopPropagation();
    setOnResize(direction);
    document.body.style.cursor = direction + "-resize";
  };

  const handleResizeEnd = () => {
    if (!onResize) return;
    setOnResize(undefined);
    document.body.style.cursor = "default";
    const r = resizableRef.current!;
    const c = props.containerRef.current!;

    const { width: cWidth, height: cHeight } = c.getBoundingClientRect();
    const { width: rWidth, height: rHeight } = r.getBoundingClientRect();

    const { left, top, right, bottom } = r.style;
    props.onResizeEnd(
      { left, top, right, bottom },
      [cWidth, cHeight],
      [rWidth, rHeight]
    );
  };

  const onResizableMove = (e: MouseEvent) => {
    if (onResize) resizeDirection([e.clientX, e.clientY])[onResize]();
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (onDrag) return;
    const containerRect = props.containerRef.current!.getBoundingClientRect();
    setLastP({
      left: e.clientX - containerRect.left,
      top: e.clientY - containerRect.top,
    });
    setOnDrag(true);
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = () => {
    if (onResize || !onDrag) return;
    setOnDrag(false);
    document.body.style.cursor = "default";
    const r = resizableRef.current!;
    const c = props.containerRef.current!;

    const { width: cWidth, height: cHeight } = c.getBoundingClientRect();
    const { width: rWidth, height: rHeight } = r.getBoundingClientRect();

    const { left, top, right, bottom } = r.style;
    props.onDragEnd(
      { left, top, right, bottom },
      [cWidth, cHeight],
      [rWidth, rHeight]
    );
  };

  const onDraggableMove = (e: React.MouseEvent) => {
    if (onDrag && !onResize) {
      const [r, c] = [resizableRef.current!, props.containerRef.current!];
      const resizableRect = r.getBoundingClientRect();
      const containerRect = c.getBoundingClientRect();

      const xFactor = e.clientX - containerRect.left - lastP.left;
      const yFactor = e.clientY - containerRect.top - lastP.top;

      // previous resizable box diretions values
      const top = resizableRect.top - containerRect.top;
      const bottom = containerRect.height - (top + resizableRect.height);
      const left = resizableRect.left - containerRect.left;
      const right = containerRect.width - (left + resizableRect.width);

      // new resizable box diretions values
      const newLeft = left + xFactor;
      const newRight = right - xFactor;
      const newTop = top + yFactor;
      const newBottom = bottom - yFactor;

      // X position border constraints
      if (newLeft < 0) {
        r.style.left = "0%";
        if (props.onLeftLimit) props.onLeftLimit();
      } else if (newRight < 0) {
        r.style.right = "0%";
        if (props.onRightLimit) props.onRightLimit();
      } else {
        r.style.left = `${(newLeft / containerRect.width) * 100}%`;
        r.style.right = `${(newRight / containerRect.width) * 100}%`;

        props.onDragX(
          [newLeft, newRight],
          [containerRect.width, containerRect.height]
        );
      }

      // Y position border constraints
      if (newTop < 0) {
        r.style.top = "0%";
        if (props.onTopLimit) props.onTopLimit();
      } else if (newBottom < 0) {
        r.style.bottom = "0%";
        if (props.onBottomLimit) props.onBottomLimit();
      } else {
        r.style.top = `${(newTop / containerRect.height) * 100}%`;
        r.style.bottom = `${(newBottom / containerRect.height) * 100}%`;

        props.onDragY(
          [newTop, newBottom],
          [containerRect.width, containerRect.height]
        );
      }

      setLastP({
        left: e.clientX - containerRect.left,
        top: e.clientY - containerRect.top,
      });
    }
  };

  return {
    resizableRef,
    handleResizeStart,
    onResizableMove,
    handleResizeEnd,
    handleDragStart,
    onDraggableMove,
    handleDragEnd,
  };
}
