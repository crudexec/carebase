import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SpecificNeedsPdfModalState {
  isOpen: boolean;
  formId: string | null;
}

const initialState: SpecificNeedsPdfModalState = {
  isOpen: false,
  formId: null,
};

export const specificNeedsPdfModalSlice = createSlice({
  name: "specificNeedsPdfModal",
  initialState,
  reducers: {
    openSpecificNeedsPdfModal: (
      state,
      action: PayloadAction<{ id: string }>
    ) => {
      state.isOpen = true;
      state.formId = action.payload.id;
    },
    closeSpecificNeedsPdfModal: (state) => {
      state.isOpen = false;
      state.formId = null;
    },
  },
});

export const { openSpecificNeedsPdfModal, closeSpecificNeedsPdfModal } =
  specificNeedsPdfModalSlice.actions;
export default specificNeedsPdfModalSlice.reducer;
