export type OfferLetterResponse = {
  data: {
    created_at: string;
    deleted_at: string | null;
    full_name: string;
    id: string;
    job_position: string;
    offer_date: string;
    offer_letter_pdf_url: string | null;
    signature: string | null;
    signed: boolean;
    updated_at: string;
    user_id: string;
  };
  message: string;
};
