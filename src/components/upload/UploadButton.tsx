"use client";

import { Upload, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/frontend/components/ui/Button";

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();

      form.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: form
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          alert(`Upload failed for ${file.name}: ${errorData?.error || res.statusText}`);
        } else {
          alert(`Upload successful for ${file.name}!`);
        }
      } catch (err: any) {
        alert(`Error uploading ${file.name}: ${err.message}`);
      }
    }
    setIsUploading(false);
    
    // Clear the input so selecting the same file again works
    if (inputRef.current) {
      inputRef.current.value = "";
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
        disabled={isUploading}
        icon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="secondary"
      >
        {isUploading ? "Uploading..." : "Upload Songs"}
      </Button>
    </>
  );
}

