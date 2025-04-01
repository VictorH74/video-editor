"use client";
import useVideoMetadataCtx from "@/hooks/useVideoMetadataCtx";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import React from "react";

export default function SelectVideoFile() {
  const [onDrag, setOnDrag] = React.useState(false);
  const { setVideoFile } = useVideoMetadataCtx();

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    selectFile(fileInput.files?.[0]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    selectFile(e.dataTransfer.files[0]);
    setOnDrag(false);
  };

  const selectFile = (file: File | undefined) => {
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert("Tamanho do vídeo deve ser no máximo 50MB");
        return;
      }
      setVideoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (onDrag) return;
    setOnDrag(true);
  };

  const handleDragLeave = () => {
    if (!onDrag) return;
    setOnDrag(false);
  };

  return (
    <div
      className="relative h-screen grid place-items-center"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
    >
      <div
        style={{ opacity: onDrag ? 1 : 0 }}
        className="duration-150 absolute pointer-events-none z-10 bg-[#ffffff] inset-0 border-dashed border-[6px] border-[#49b5d6a9] grid place-items-center"
      >
        <div>
          <div className="relative bg-transparent border-4 border-double border-transparent rounded-xl bg-origin-border box-border grad">
            <ArrowDownwardIcon
              className="animate-bounce mt-12 mb-8 mx-12"
              sx={{ fontSize: 70, color: "#292929" }}
            />
          </div>
        </div>
      </div>

      <div className="text-center">
        <div
          className="relative"
          style={{ pointerEvents: onDrag ? "none" : "all" }}
        >
          <label
            className="inline-block py-3 px-10 hover:scale-105 duration-150 cursor-pointer rounded-md bg-linear-to-r from-blue-500 from-1% to-cyan-400 to-90% text-base font-semibold uppercase text-white"
            htmlFor="video-uploader"
          >
            Abrir vídeo
          </label>
          <input
            className="absolute -z-1 top-1 left-1 opacity-0"
            onChange={handleSelectChange}
            type="file"
            name="video"
            id="video-uploader"
            accept=".mp4,.webm"
          />
        </div>
        <p className="mt-3 text-slate-600 text-lg">
          Ou arraste um vídeo para essa tela
        </p>
      </div>
    </div>
  );
}
