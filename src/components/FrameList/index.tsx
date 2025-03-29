import Image from "next/image";

interface Props {
  frames: string[];
  frameWidth: number;
  frameHeight: number;
}
export default function FrameList(props: Props) {
  return (
    <div className="overflow-hidden h-full flex flex-row justify-center">
      {props.frames.map((f, i) => (
        <Image
          style={{
            width: "auto",
            height: "auto",
          }}
          key={i}
          width={props.frameWidth}
          height={props.frameHeight}
          src={f}
          alt="frame"
        />
      ))}
    </div>
  );
}
