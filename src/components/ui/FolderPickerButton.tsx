"use client";

import { FolderOpen, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import { useRef, useState } from "react";

import { parseSongFiles } from "@/frontend/lib/metadata";
import { usePlayerStore } from "@/frontend/store/player.store";
import { Button } from "@/frontend/components/ui/Button";

type DirectoryInputProps = InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
};

interface FolderPickerButtonProps {
  label?: string;
  navigateOnLoad?: boolean;
  className?: string;
}

export function FolderPickerButton({
  label = "Open Folder",
  navigateOnLoad = false,
  className
}: FolderPickerButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setSongs = usePlayerStore((state) => state.setSongs);
  const [isLoading, setIsLoading] = useState(false);

  const onSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList?.length) {
      return;
    }

    setIsLoading(true);
    try {
      const { songs, folderName } = await parseSongFiles(fileList);
      setSongs(songs, folderName);

      if (navigateOnLoad) {
        router.push("/player");
      }
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Button
        className={className}
        icon={isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
        onClick={() => inputRef.current?.click()}
        type="button"
        variant="secondary"
      >
        {label}
      </Button>
      <input
        {...({ webkitdirectory: "", directory: "" } as DirectoryInputProps)}
        ref={inputRef}
        accept=".mp3,.flac,.wav,.ogg"
        className="hidden"
        multiple
        onChange={onSelectFiles}
        type="file"
      />
    </>
  );
}

