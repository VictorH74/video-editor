import React from "react";

import Tooltip from "@mui/material/Tooltip";
import useEditorTools from "./useEditorTools";
import { BaseBtn } from "@/components/buttons";
import { twMerge } from "tailwind-merge";

export default React.memo(function EditorTools() {
  const { tools, setToolAction, toolAction } = useEditorTools();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") console.log("EditorTools");
  });

  return (
    <div className="flex gap-[2px]">
      {tools.map(({ icon: Icon, ...rest }, i) => (
        <div className="relative" key={i}>
          <div
            style={{ opacity: rest.modified ? 1 : 0 }}
            className="duration-150 contents-[''] size-[6px] absolute right-1 top-1 bg-[#64CCC5] rounded-full"
          />
          <Tooltip title={rest.label} placement="top">
            <BaseBtn
              ref={ref}
              first={i == 0}
              last={i == tools.length - 1}
              selected={toolAction === rest.action}
              onClick={() => {
                if (rest.action !== toolAction) setToolAction(rest.action);
              }}
            >
              <div>
                <Icon />
              </div>
            </BaseBtn>
          </Tooltip>
        </div>
      ))}
    </div>
  );
});
