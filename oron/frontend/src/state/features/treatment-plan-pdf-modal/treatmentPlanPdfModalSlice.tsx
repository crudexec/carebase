import { SingleTreatmentPlan } from "@/types/Events";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TreatmentPlanPdfModalState {
  isOpen?: boolean;
  data: SingleTreatmentPlan | null;
}

const initialState: TreatmentPlanPdfModalState = {
  isOpen: false,
  data: null,
};

export const treatmentPlanPdfModalSlice = createSlice({
  name: "treatmentPlanPdfModal",
  initialState,
  reducers: {
    openTreatmentPlanPdfModal: (
      state,
      action: PayloadAction<SingleTreatmentPlan>
    ) => {
      state.isOpen = true;
      state.data = action.payload;
    },
    closeTreatmentPlanPdfModal: (state) => {
      state.isOpen = false;
      state.data = null;
    },
    clearTreatmentPlanPdfData: (state) => {
      state.data = null;
    },
    addTreatmentPlanPdfData: (
      state,
      action: PayloadAction<SingleTreatmentPlan>
    ) => {
      state.data = action.payload;
    },
  },
});

export const {
  openTreatmentPlanPdfModal,
  closeTreatmentPlanPdfModal,
  clearTreatmentPlanPdfData,
  addTreatmentPlanPdfData,
} = treatmentPlanPdfModalSlice.actions;
export default treatmentPlanPdfModalSlice.reducer;
