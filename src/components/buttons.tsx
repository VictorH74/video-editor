import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import ClearIcon from "@mui/icons-material/Clear";
import React from "react";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import { color2 } from "@/utils/constants";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  selected?: boolean;
  onClick: () => void;
  children: React.ReactElement | string;
  rounded?: boolean;
  first?: boolean;
  last?: boolean;
  className?: string;
  iconClassName?: string;
  onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseOut?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const defaultBg = "#00000060";
export const hoverBg = color2;
export const selectedBg = color2;
export const defaultFontColor = "#ececec";
export const hoverFontColor = "#6d6d6d";

export const BaseBtn = (props: ButtonProps) => {
  const { children, ref, className, first, last, rounded, ...otherProps } =
    props;

  return (
    <button
      ref={ref}
      {...otherProps}
      className={twMerge(
        "overflow-hidden",
        className,
        first && "rounded-s-lg",
        last && "rounded-e-lg",
        rounded && "rounded-lg"
      )}
      onClick={props.onClick}
    >
      <div
        className={twMerge("duration-150 p-3", props.className)}
        style={{
          backgroundColor: props.selected ? selectedBg : defaultBg,
          color: props.selected ? hoverFontColor : defaultFontColor,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = hoverBg;
          e.currentTarget.style.color = hoverFontColor;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = props.selected
            ? selectedBg
            : defaultBg;
          e.currentTarget.style.color = props.selected
            ? hoverFontColor
            : defaultFontColor;
        }}
      >
        {children}
      </div>
    </button>
  );
};

export const Button: React.FC<ButtonProps> = (props) => <BaseBtn {...props} />;

interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & {
    muiName: string;
  };
  label?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  iconClassName,
  ...rest
}) => (
  <BaseBtn {...rest}>
    <div>
      <Icon className={iconClassName || ""} />
      {label && <span className="ml-2">{label}</span>}
    </div>
  </BaseBtn>
);

// eslint-disable-next-line react/display-name
export const ClearBtn = React.memo(() => {
  const { setVideoUrl } = useVideoMetadataCtx();

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.log("ClearBtn");
  });

  return (
    <button
      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-200"
      onClick={() => setVideoUrl(null)}
    >
      <ClearIcon sx={{ fontSize: 35 }} />
    </button>
  );
});
