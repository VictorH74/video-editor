/* eslint-disable @typescript-eslint/ban-types */
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import ClearIcon from "@mui/icons-material/Clear";
import React from "react";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import { color2 } from "@/utils/constants";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  first?: boolean;
  last?: boolean;
  rounded?: boolean;
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactElement | string;
  className?: string;
  iconClassName?: string;
  onMouseOver?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseOut?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface IconButtonProps extends Omit<ButtonProps, "children"> {
  icon: OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  };
  label?: string;
}

export const defaultBg = "#00000060";
export const hoverBg = color2;
export const selectedBg = color2;
export const defaultFontColor = "#ececec";
export const hoverFontColor = "#6d6d6d";

export const BaseBtn = React.forwardRef(function BaseBtn(
  props: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const { children, ...otherProps } = props;

  return (
    <button
      ref={ref}
      {...otherProps}
      className={`overflow-hidden ${
        props.rounded
          ? "rounded-lg"
          : props.first
          ? "rounded-s-lg"
          : props.last
          ? "rounded-e-lg"
          : ""
      } `}
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
});

export const Button: React.FC<ButtonProps> = (props) => <BaseBtn {...props} />;

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  label,
  ...rest
}) => (
  <BaseBtn {...rest}>
    <div>
      <Icon className={rest.iconClassName} />
      {label && <span className="ml-2">{label}</span>}
    </div>
  </BaseBtn>
);

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
