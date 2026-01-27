import { UseStepper } from "headless-stepper";

import { cn } from "@/lib";

type Props = {
  steps: { label: string }[];
  stepper: UseStepper;
  completed: boolean;
  withLabel?: boolean;
};

export const Stepper = ({ withLabel, steps, stepper, completed }: Props) => {
  const { state, stepperProps, stepsProps, progressProps } = stepper;

  return (
    <>
      <nav className="my-4 w-auto grid grid-cols-6 relative" {...stepperProps}>
        <ol className="col-span-full flex flex-row z-1">
          {stepsProps?.map((_, index) => {
            const done = state?.currentStep > index || completed;
            const active = state?.currentStep === index;
            return (
              <li className="text-center flex-1 relative" key={index}>
                {index !== 0 && (
                  <div
                    className="absolute left-[calc(-50%+20px)] right-[calc(50%+20px)] top-[15px]"
                    {...progressProps}
                  >
                    <div
                      className={cn(
                        "h-0.5 bg-white w-full",
                        state.currentStep > index - 1
                          ? "bg-foreground"
                          : "bg-border",
                      )}
                    ></div>
                  </div>
                )}

                <div className="group flex flex-col items-center focus:outline-0">
                  <span
                    className={cn(
                      "flex items-center justify-center w-8 h-8 border-full rounded-full group-focus:ring-2 group-focus:ring-offset-2 transition-colors ease-in-out",
                      active &&
                        "ring-2 ring-inherit dark:!bg-inherit dark:text-white",
                      done
                        ? "bg-primary dark:!bg-white !text-background"
                        : "bg-border dark:text-white",
                    )}
                  >
                    {index + 1}
                  </span>
                  {withLabel && (
                    <span
                      className={`text-sm ${done ? "font-semibold" : ""} mt-2`}
                    >
                      {steps[index].label}{" "}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
