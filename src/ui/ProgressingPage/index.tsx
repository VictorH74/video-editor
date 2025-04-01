import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}));

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <div className="w-[300px]">
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" fontSize={22} color="text.secondary">
          Processando vídeo
        </Typography>
      </Box>
      <Box sx={{ minWidth: 35, marginBottom: 2 }}>
        <Typography variant="body2" fontSize={22} color="text.secondary">
          Aguarde
        </Typography>
      </Box>
      <Box sx={{ width: "100%", mr: 1 }}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35, marginY: 2 }}>
        <Typography
          variant="body2"
          fontSize={22}
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </div>
  );
}

export default function ProgressingPage() {
  // const [progress, setProgress] = React.useState(10);
  const { progress, creatingVideoUrl } = useOutputVideoCtx();

  return (
    <div className="w-screen h-screen grid place-items-center text-center">
      {creatingVideoUrl ? (
        <Typography variant="body2" fontSize={22} color="text.secondary">
          Finalizando...
        </Typography>
      ) : (
        <LinearProgressWithLabel value={progress} />
      )}
    </div>
  );
}
