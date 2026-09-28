"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { DocumentUpload } from "@/components/flow/document-upload";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { flow, statusPage } from "@/lib/copy";
import type { DocumentType } from "@/lib/data/types";

/**
 * Upload a document from the status page: a button that opens a dialog
 * with the camera-first uploader. On success the page refreshes in place.
 */
export function UploadDialog({
  refValue,
  documentType,
  label,
  variant = "secondary",
}: {
  refValue: string;
  documentType: DocumentType;
  /** Button text, e.g. "Upload KRA PIN certificate". */
  label: string;
  variant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const name = flow.documents[documentType];
  const inline = flow.documentsInline[documentType];
  const copy = statusPage.upload;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className="w-full sm:w-auto">
          <Upload aria-hidden />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent title={copy.dialogTitle(inline)} description={copy.dialogDescription}>
        <DocumentUpload
          kind={documentType}
          refValue={refValue}
          label={copy.label(inline)}
          hint={copy.reassurance}
          takePhotoLabel={flow.logbook.takePhoto}
          chooseFileLabel={flow.logbook.chooseFile}
          errorMessages={flow.id.errors}
          successToast={copy.toast(name)}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
