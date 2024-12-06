/* eslint-disable jsx-a11y/media-has-caption */

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface VideoDropzoneProps {
  onUpload: (video: File) => void;
  disabled?: boolean;
}

export function VideoDropzone(props: VideoDropzoneProps) {
  const [video, setVideo] = useState<File | null>(null);

  const { onUpload, disabled } = props;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setVideo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".wmv"],
    },
    multiple: false,
  });

  const removeVideo = () => {
    setVideo(null);
  };

  const handleUpload = () => {
    if (video) {
      onUpload(video);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-gray-800"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input {...getInputProps()} />
        {video ? (
          <div className="space-y-4">
            <video className="w-full rounded" controls>
              <source src={URL.createObjectURL(video)} type={video.type} />
              Your browser does not support the video tag.
            </video>
            <p className="text-sm text-gray-500">{video.name}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeVideo();
              }}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isDragActive
                ? "Drop the video here"
                : "Drag & drop a video here"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: MP4, MOV, AVI, WMV
            </p>
          </div>
        )}
      </div>
      {video && (
        <button
          onClick={handleUpload}
          disabled={disabled}
          className="mt-4 w-full px-4 py-2 text-gray-300 bg-blue-500 rounded hover:bg-blue-600 transition-colors
          disabled:cursor-not-allowed
          disabled:opacity-50"
        >
          {disabled ? "Converting..." : "Convert to mp3"}
        </button>
      )}
    </div>
  );
}
