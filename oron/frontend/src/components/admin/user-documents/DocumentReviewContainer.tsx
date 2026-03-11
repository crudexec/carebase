import React from "react";
import DocumentReview from "./DocumentReview";
import { AdmimUserDocument } from "@/types/AdminTypes";

const DocumentReviewContainer = ({
  userId,
  documentId,
  selectedDocument,
  name,
  userDocument,
}: {
  userId: string;
  documentId: string | null;
  selectedDocument: string | null;
  name: string;
  userDocument: AdmimUserDocument | undefined;
}) => {
  const document = userDocument?.data?.find(
    (doc) => doc.document_title === selectedDocument
  );

  return (
    <div>
      {selectedDocument &&
        document &&
        typeof document?.document_url === "string" &&
        document?.document_url?.length > 10 && (
          <DocumentReview
            documentId={documentId!}
            documentName={selectedDocument}
            name={name}
            userId={userId}
            document={document}
          />
        )}
    </div>
  );
};

export default DocumentReviewContainer;
