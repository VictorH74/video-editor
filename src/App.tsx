import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import useOutputVideoCtx from "@/hooks/useOutputVideoCtx";
import DownloadFinalVideo from "@/ui/DownloadFinalVideo";
import ProgressingPage from "@/ui/ProgressingPage";
import EditorWorkSpace from "@/ui/EditorWorkSpace";
import SelectVideoFile from "@/ui/SelectVideoFile";

function App() {
  const { videoUrl } = useVideoMetadataCtx();
  const { exportedVideoUrl, processingVideo } = useOutputVideoCtx();

  // return <ProgressingPage />;

  if (exportedVideoUrl) return <DownloadFinalVideo />;
  if (processingVideo) return <ProgressingPage />;

  return <main>{videoUrl ? <EditorWorkSpace /> : <SelectVideoFile />}</main>;
}

export default App
