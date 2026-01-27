"use client";
import * as React from "react";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";

import { cn } from "@/lib";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  errorText?: string;
  leftIcon?: React.ReactNode;
  noFocusRing?: boolean;
  rightSection?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, noFocusRing, rightSection, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const childRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => childRef.current as HTMLInputElement);

    const EyeIcon = React.useMemo(
      () => (showPassword ? RxEyeClosed : RxEyeOpen),
      [showPassword],
    );

    return (
      <div className={`flex items-center gap-3 relative`}>
        {leftIcon && leftIcon}
        <input
          className={cn(
            "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
            noFocusRing &&
              "focus-visible:ring-0 focus:outline-none focus-visible:ring-offset-0",
          )}
          ref={childRef}
          {...props}
          type={
            props?.type === "password"
              ? showPassword
                ? "text"
                : "password"
              : props?.type
          }
          onClick={() => {
            if (props?.type === "time") {
              childRef?.current?.showPicker();
            }
          }}
        />
        {props?.type === "password" && (
          <EyeIcon
            size={24}
            className="cursor-pointer text-gray-400 absolute right-3 file:right-2 top-1/2 file:top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword((prev) => !prev)}
          />
        )}
        {rightSection && rightSection}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
