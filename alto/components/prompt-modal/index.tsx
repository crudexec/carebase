import React from "react";

import { Button, Modal } from "../ui";

const PromptModal = ({
  title,
  description,
  open,
  onClose,
  callback,
  loading,
  variant,
  secondaryVariant = "secondary",
  primaryLabel = "Continue",
  secondaryLabel = "Cancel",
  children,
  disabled,
}: {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  callback: () => void;
  loading?: boolean;
  variant:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
  secondaryVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  primaryLabel?: string;
  secondaryLabel?: string;
  disabled?: boolean;
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      className="md:max-w-[600px]"
    >
      <p className="text-sm pb-3">{description}</p>
      {children}
      <div className="flex flex-wrap gap-2 justify-between">
        <Button
          className="w-full md:w-fit"
          onClick={onClose}
          disabled={loading}
          variant={secondaryVariant}
        >
          {secondaryLabel}
        </Button>
        <Button
          className="w-full md:w-fit"
          onClick={callback}
          loading={loading}
          variant={variant}
          disabled={disabled}
        >
          {primaryLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default PromptModal;
