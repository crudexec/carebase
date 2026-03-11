import { configureStore } from "@reduxjs/toolkit";
import visitPdfModalReducer from "./features/visit-pdf-modal/visitPdfModalSlice";
import treatmentPlanPdfModalReducer from "./features/treatment-plan-pdf-modal/treatmentPlanPdfModalSlice";
import specificNeedsPdfModalReducer from "./features/specific-needs-pdf-modal/specificNeedsPdfModalSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      visitPdfModal: visitPdfModalReducer,
      treatmentPlanPdfModal: treatmentPlanPdfModalReducer,
      specificNeedsPdfModal: specificNeedsPdfModalReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
