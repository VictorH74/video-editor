interface Props {
    sectionRef: React.RefObject<HTMLDivElement>
    show: boolean;
    className?: string
}

export default function PlaybackControlTrack(props: Props) {
    return (
        <div
        ref={props.sectionRef}
        className={`absolute pointer-events-none top-0 bottom-0 opacity-70 ${props.className}`}
        style={{
          backgroundColor:
            props.show ? "rgb(100 116 139)" : "transparent",
        }}
      />
    )
}