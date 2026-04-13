"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/frontend/components/ui/Button";

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const form = new FormData();

      form.append("file", file);

      await fetch("/api/upload", {
        method: "POST",
        body: form
      });
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
      >
        Upload Songs
      </Button>
    </>
  );
}

