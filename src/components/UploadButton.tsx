"use client";

import { Upload } from "lucide-react";
import { Button } from "~/components/ui/button";

interface UploadButtonProps {
  onClick: () => void;
  className?: string;
}

export function UploadButton({ onClick, className = "" }: UploadButtonProps) {
  return (
    <Button onClick={onClick} className={className}>
      <Upload className="mr-2 h-4 w-4" />
      Upload
    </Button>
  );
}
