import React, { ReactNode } from "react";

type ComponentFunction = React.FC<{ children: ReactNode }>;

export const combineComponents = (
  ...components: ComponentFunction[]
): React.FC<{ children: ReactNode }> => {
  return components.reduce(
    (AccumulatedComponents, CurrentComponent) => {
      const CombinedComponent: React.FC<{ children: ReactNode }> = ({
        children,
      }) => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
      CombinedComponent.displayName = `Combined(${CurrentComponent.displayName || CurrentComponent.name || "Component"})`;
      return CombinedComponent;
    },
    ({ children }) => <>{children}</>,
  );
};
