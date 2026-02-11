"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { FAQItem } from "@/content/help";

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQSection({ items, title = "Frequently Asked Questions", className = "" }: FAQSectionProps) {
  return (
    <div className={className}>
      {title && (
        <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <FAQItemComponent key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

interface FAQItemComponentProps {
  item: FAQItem;
  defaultOpen?: boolean;
}

function FAQItemComponent({ item, defaultOpen = false }: FAQItemComponentProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-background-secondary transition-colors"
      >
        <span className="font-medium text-foreground pr-4">{item.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-foreground-tertiary flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-1">
          <div className="text-foreground-secondary text-sm whitespace-pre-line">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}
