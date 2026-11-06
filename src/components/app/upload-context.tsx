import { createContext, useContext, useState, type ReactNode } from "react";
import { ResumeUploadDialog } from "@/components/candidates/resume-upload-dialog";

const UploadDialogContext = createContext<{ openUpload: () => void } | null>(null);

/** Lets any workspace page open the shared multi-resume upload dialog. */
export function UploadDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <UploadDialogContext.Provider value={{ openUpload: () => setOpen(true) }}>
      {children}
      <ResumeUploadDialog open={open} onOpenChange={setOpen} />
    </UploadDialogContext.Provider>
  );
}

export function useUploadDialog() {
  const ctx = useContext(UploadDialogContext);
  if (!ctx) throw new Error("useUploadDialog must be used inside UploadDialogProvider");
  return ctx;
}
