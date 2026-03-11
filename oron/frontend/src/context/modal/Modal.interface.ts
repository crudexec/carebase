export interface ModalContextType {
  isModalOpen: boolean
  openModal: (data?: any) => void
  closeModal: () => void
  clearData: () => void
  data: any
}
