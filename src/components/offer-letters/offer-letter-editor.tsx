"use client";

import * as React from "react";
import { Bold, Heading2, Italic, List, ListOrdered, Quote, Underline } from "lucide-react";
import { Button } from "@/components/ui";
import { DEFAULT_OFFER_TAGS } from "@/lib/offer-letters/rendering";
import { offerBodyToEditorHtml, sanitizeOfferHtml } from "@/lib/offer-letters/html";

type Props = {
  initialValue: string;
  onChange: (html: string) => void;
};

const tools = [
  { label: "Bold", icon: Bold, command: "bold" },
  { label: "Italic", icon: Italic, command: "italic" },
  { label: "Underline", icon: Underline, command: "underline" },
  { label: "Heading", icon: Heading2, command: "formatBlock", value: "<h2>" },
  { label: "Bulleted list", icon: List, command: "insertUnorderedList" },
  { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
  { label: "Quote", icon: Quote, command: "formatBlock", value: "<blockquote>" },
] as const;

export function OfferLetterEditor({ initialValue, onChange }: Props) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [html] = React.useState(() => offerBodyToEditorHtml(initialValue));

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  };

  const insertTag = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, `{${tag}}`);
    sync();
  };

  const sync = () => {
    if (!editorRef.current) return;
    const next = sanitizeOfferHtml(editorRef.current.innerHTML);
    onChange(next);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background-secondary p-2" aria-label="Letter formatting">
        {tools.map(({ label, icon: Icon, command, ...rest }) => (
          <Button
            key={label}
            type="button"
            variant="ghost"
            size="sm"
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command, "value" in rest ? rest.value : undefined)}
            className="h-8 w-8 p-0"
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <span className="mx-1 h-5 border-l border-border" aria-hidden="true" />
        <label className="sr-only" htmlFor="offer-letter-tag">Insert field</label>
        <select
          id="offer-letter-tag"
          className="h-8 max-w-52 rounded-md border border-border bg-background px-2 text-xs"
          value=""
          onChange={(event) => {
            if (event.target.value) insertTag(event.target.value);
            event.target.value = "";
          }}
        >
          <option value="">Insert field…</option>
          {DEFAULT_OFFER_TAGS.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-label="Offer letter body"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        dangerouslySetInnerHTML={{ __html: html }}
        className="min-h-80 max-h-[680px] overflow-y-auto bg-white p-6 text-sm leading-7 text-slate-900 outline-none [&_h2]:my-4 [&_h2]:text-xl [&_li]:ml-6 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4"
      />
      <div className="border-t border-border bg-background-secondary px-3 py-2 text-xs text-foreground-secondary">
        Choose a field to insert recipient or company information. Formatting is preserved in the recipient letter.
      </div>
    </div>
  );
}
