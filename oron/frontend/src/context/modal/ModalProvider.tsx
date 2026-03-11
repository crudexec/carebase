import React, { createContext, useState, ReactNode, useContext } from "react";
import { ModalName } from "./ModalNames";

interface ModalState {
  [key: string]: {
    isOpen: boolean;
    data: any;
  };
}

export interface ModalContextType {
  openModal: (modalName: ModalName, data?: any) => void;
  closeModal: (modalName: ModalName) => void;
  clearData: (modalName: ModalName) => void;
  isModalOpen: (modalName: ModalName) => boolean;
  getData: (modalName: ModalName) => any;
}

const ModalContext = createContext<ModalContextType>(null!);

export const useModalContext = () => useContext(ModalContext);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<ModalState>({});

  const openModal = (modalName: ModalName, data?: any) => {
    setModals((prevModals) => ({
      ...prevModals,
      [modalName]: {
        isOpen: true,
        data: data ?? null,
      },
    }));
  };

  const closeModal = (modalName: ModalName) => {
    setModals((prevModals) => ({
      ...prevModals,
      [modalName]: {
        ...prevModals[modalName],
        isOpen: false,
      },
    }));
  };

  const clearData = (modalName: ModalName) => {
    setModals((prevModals) => ({
      ...prevModals,
      [modalName]: {
        ...prevModals[modalName],
        data: null,
      },
    }));
  };

  const isModalOpen = (modalName: ModalName) => {
    return !!modals[modalName]?.isOpen;
  };

  const getData = (modalName: ModalName) => {
    return modals[modalName]?.data;
  };

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        clearData,
        isModalOpen,
        getData,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
