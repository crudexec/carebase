export type DeclinationPersonalInformation = {
  created_at: string;
  date_of_filling_form: string;
  deleted_at: string | null;
  department: string;
  first_name: string;
  id: string;
  last_name: string;
  updated_at: string;
  user_id: string;
};

export type DeclinationFormResponse = {
  message: string;
  data: {
    status: string;
    declinationForm: any;
    personalInformation: DeclinationPersonalInformation;
    influenzaFullForm: any;
    signatureForm: any;
  };
};
