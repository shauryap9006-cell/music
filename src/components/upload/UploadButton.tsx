"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/frontend/components/ui/Button";
import { usePlayerStore } from "@/frontend/store/player.store";

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const refreshLibrary = usePlayerStore((state) => state.refreshLibrary);

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: form
        });

        const result = await response.json();
        
        if (!response.ok) {
          alert(result.error || "Upload failed");
          continue;
        }
      }
      
      // Refresh the library state to show new songs instantly
      await refreshLibrary();
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        accept=".mp3,.flac,.wav,.ogg"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            void handleFiles(event.target.files);
          }
        }}
        ref={inputRef}
        style={{ display: "none" }}
        type="file"
      />
      <Button
        icon={<Upload className="h-4 w-4" />}
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="secondary"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Songs"}
      </Button>
    </>
  );
}

