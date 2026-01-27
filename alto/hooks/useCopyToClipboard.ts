"use client";
import React from "react";

const useCopyToClipboard = (value: string, timeout: number) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(
      function () {
        setCopied(false);
      }.bind(this),
      timeout,
    );
  };

  return {
    copy,
    copied,
  };
};

export default useCopyToClipboard;
