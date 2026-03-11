export type Document = {
  created_at: string;
  deleted_at: string | null;
  document_title: string;
  document_url: string;
  id: string;
  owner: string;
  updated_at: string;
  status: string;
  review_notes?: string | null;
};

export type UserDocument = {
  data: Document[];
  message: string;
};
