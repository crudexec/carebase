import { VisitData } from "@/types/Visit";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VsitPdfModalState {
  isOpen?: boolean;
  data: VisitData | null;
}

const initialState: VsitPdfModalState = {
  isOpen: false,
  data: null,
};

export const visitPdfModalSlice = createSlice({
  name: "visitPdfModal",
  initialState,
  reducers: {
    openVisitPdfModal: (state, action: PayloadAction<VisitData>) => {
      state.isOpen = true;
      state.data = action.payload;
    },
    closeVisitPdfModal: (state) => {
      state.isOpen = false;
      state.data = null;
    },
    clearVisitPdfData: (state) => {
      state.data = null;
    },
    addVisitPdfData: (state, action: PayloadAction<VisitData>) => {
      state.data = action.payload;
    },
  },
});

export const {
  openVisitPdfModal,
  closeVisitPdfModal,
  clearVisitPdfData,
  addVisitPdfData,
} = visitPdfModalSlice.actions;
export default visitPdfModalSlice.reducer;
