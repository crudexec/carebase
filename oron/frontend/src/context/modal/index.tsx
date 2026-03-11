import { useModalContext } from "./ModalProvider";
import { ModalName } from "./ModalNames";

const useModal = (modalName: ModalName) => {
  const {
    openModal: openModalContext,
    closeModal: closeModalContext,
    clearData: clearDataContext,
    isModalOpen: isModalOpenContext,
    getData: getDataContext,
  } = useModalContext();

  const openModal = (data?: any) => openModalContext(modalName, data);
  const closeModal = () => closeModalContext(modalName);
  const clearData = () => clearDataContext(modalName);
  const isModalOpen = isModalOpenContext(modalName);
  const data = getDataContext(modalName);

  return { openModal, closeModal, clearData, isModalOpen, data };
};

export default useModal;
