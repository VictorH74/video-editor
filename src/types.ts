export type HandlerType =
  | "sw"
  | "se"
  | "nw"
  | "ne"
  | "w"
  | "e"
  | "n"
  | "s"
  | undefined;

export type DirectionType = "left" | "top" | "right" | "bottom";

export type Directions = Record<"left" | "top" | "right" | "bottom", string>;

export type DimentionType = [number, number] // [w, h]

export type TextBoxType = {
  directions: Partial<Directions>;
  content: string;
};

export type ImageBoxType = { directions: Partial<Directions>; src: string };