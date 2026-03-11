"use client";

import BiodataReview from "./form-review/BiodataReview";
import INineReview from "./form-review/INineReview";
import TbReview from "./form-review/TbReview";
import EmployeeDemographicReview from "./form-review/EmployeeDemographicReview";
import PneumococcalReview from "./form-review/PneumococcalReview";
import HepatitisReview from "./form-review/HepatitisReview";
import VaricellaReview from "./form-review/VaricellaReview";
import MmrReview from "./form-review/MmrReview";
import FluVaccineReview from "./form-review/FluVaccineReview";
import { UserFormInfo } from "@/types/AdminTypes";
import ReferenceReview from "./form-review/ReferenceReview";
import OfferLetterReview from "./form-review/OfferLetterReview";
import CjisReview from "./form-review/CjisReview";

const FormReviewContainer = ({
  selectedForm,
  name,
  formInfo,
  id,
  baseRoute,
}: {
  selectedForm: string | null;
  name: string;
  formInfo: UserFormInfo | undefined;
  id: string;
  baseRoute?: string;
}) => {
  return (
    <div>
      {selectedForm === "offerLetter" && (
        <OfferLetterReview id={id} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "biodata" && (
        <BiodataReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "refForm" && (
        <ReferenceReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "i9" && (
        <INineReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "tbForm" && (
        <TbReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "employeeDemographic" && (
        <EmployeeDemographicReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "pneumococcalVaccination" && (
        <PneumococcalReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "hepatitisVaccination" && (
        <HepatitisReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "varicellaVaccine" && (
        <VaricellaReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "mmrVaccine" && (
        <MmrReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "fluVaccine" && (
        <FluVaccineReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
      {selectedForm === "cjisAttestation" && (
        <CjisReview id={id} formInfo={formInfo} name={name} baseRoute={baseRoute} />
      )}
    </div>
  );
};

export default FormReviewContainer;
