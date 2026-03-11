import ConfirmModal from "@/components/ConfirmDialog";
import { ModalProvider } from "./modal/ModalProvider";
import { GlobalStateProvider } from "./global-state";

export const ContextProviders = ({ children }: any) => (
  <ModalProvider>
    <GlobalStateProvider>{children}</GlobalStateProvider>
  </ModalProvider>
);
