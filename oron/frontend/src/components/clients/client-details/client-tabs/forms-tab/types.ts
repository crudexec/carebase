export interface ClientDocumentTypes {
  id: string;
  document: string;
  progress: number;
  dateCreated: string;
  lastModified: string;
  route: string;
  formId: string;
  downloadLink: string;
  admin: boolean;
  status: string;
  canDownload: boolean;
}
