"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={2000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast className="justify-start items-start" key={id} {...props}>
            {props.variant !== "destructive" && (
              <Image
                src="/assets/images/dashboard/checkmark.svg"
                width={50}
                height={50}
                alt="checkmark"
              />
            )}

            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}

              {action}
            </div>

            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
