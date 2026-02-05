// Sinch Fax API Integration

const SINCH_API_BASE = "https://fax.api.sinch.com/v3";

interface SinchFaxResponse {
  id: string;
  direction: "OUTBOUND" | "INBOUND";
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILURE";
  to: string;
  from: string;
  numberOfPages?: number;
  pagesSentSuccessfully?: number;
  createTime: string;
  completedTime?: string;
  errorCode?: number;
  errorMessage?: string;
  price?: {
    amount: string;
    currencyCode: string;
  };
}

interface SendFaxOptions {
  to: string; // E.164 format
  contentUrl?: string;
  file?: Buffer;
  fileName?: string;
  headerText?: string;
  callbackUrl?: string;
}

function getAuthHeader(): string {
  const accessKey = process.env.SINCH_ACCESS_KEY;
  const accessKeySecret = process.env.SINCH_ACCESS_KEY_SECRET;

  if (!accessKey || !accessKeySecret) {
    throw new Error("Sinch credentials not configured");
  }

  const credentials = Buffer.from(`${accessKey}:${accessKeySecret}`).toString("base64");
  return `Basic ${credentials}`;
}

export async function sendFax(options: SendFaxOptions): Promise<SinchFaxResponse> {
  const projectId = process.env.SINCH_PROJECT_ID;
  const fromNumber = process.env.SINCH_FAX_NUMBER;

  if (!projectId) {
    throw new Error("SINCH_PROJECT_ID not configured");
  }

  if (!fromNumber) {
    throw new Error("SINCH_FAX_NUMBER not configured");
  }

  const url = `${SINCH_API_BASE}/projects/${projectId}/faxes`;

  // For file uploads, we need to use FormData
  if (options.file) {
    console.log("Sending fax to Sinch:", {
      url,
      to: options.to,
      from: fromNumber,
      fileName: options.fileName,
      fileSize: options.file.length,
      headerText: options.headerText,
      callbackUrl: options.callbackUrl,
    });

    const formData = new FormData();
    formData.append("to", options.to);
    formData.append("from", fromNumber);

    // Create a Blob from the Buffer for the file
    const uint8Array = new Uint8Array(options.file);
    const blob = new Blob([uint8Array], { type: "application/pdf" });
    formData.append("file", blob, options.fileName || "document.pdf");

    if (options.headerText) {
      formData.append("headerText", options.headerText);
    }

    if (options.callbackUrl) {
      formData.append("callbackUrl", options.callbackUrl);
      formData.append("callbackUrlContentType", "application/json");
    }

    console.log("FormData fields:", {
      to: options.to,
      from: fromNumber,
      fileName: options.fileName,
      headerText: options.headerText,
      callbackUrl: options.callbackUrl,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
      },
      body: formData,
    });

    console.log("Sinch API response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Sinch API error response:", errorJson);
        errorMessage = errorJson.message || errorJson.error || errorJson.detail || JSON.stringify(errorJson);
      } catch {
        console.error("Sinch API error text:", errorText);
        errorMessage = errorText || response.statusText;
      }
      throw new Error(`Sinch API error (${response.status}): ${errorMessage}`);
    }

    return response.json();
  }

  // For URL-based content
  if (options.contentUrl) {
    const body: Record<string, unknown> = {
      to: options.to,
      from: fromNumber,
      contentUrl: options.contentUrl,
    };

    if (options.headerText) {
      body.headerText = options.headerText;
    }

    if (options.callbackUrl) {
      body.callbackUrl = options.callbackUrl;
      body.callbackUrlContentType = "application/json";
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Sinch API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  throw new Error("Either file or contentUrl must be provided");
}

export async function getFaxStatus(faxId: string): Promise<SinchFaxResponse> {
  const projectId = process.env.SINCH_PROJECT_ID;

  if (!projectId) {
    throw new Error("SINCH_PROJECT_ID not configured");
  }

  const url = `${SINCH_API_BASE}/projects/${projectId}/faxes/${faxId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Sinch API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

// Get the fax document content (PDF) for an inbound fax
export async function getFaxDocument(faxId: string): Promise<Buffer> {
  const projectId = process.env.SINCH_PROJECT_ID;

  if (!projectId) {
    throw new Error("SINCH_PROJECT_ID not configured");
  }

  const url = `${SINCH_API_BASE}/projects/${projectId}/faxes/${faxId}/file`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    const error = await response.text().catch(() => response.statusText);
    throw new Error(`Sinch API error fetching fax document: ${error}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Download fax document and return as base64 encoded string
export async function getFaxDocumentBase64(faxId: string): Promise<string> {
  const buffer = await getFaxDocument(faxId);
  return buffer.toString("base64");
}

// List faxes with optional filters
interface ListFaxesOptions {
  direction?: "INBOUND" | "OUTBOUND";
  status?: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILURE";
  to?: string;
  from?: string;
  createTimeAfter?: string; // ISO 8601 format
  createTimeBefore?: string; // ISO 8601 format
  pageSize?: number;
  pageToken?: string;
}

interface ListFaxesResponse {
  faxes: SinchFaxResponse[];
  nextPageToken?: string;
  totalSize?: number;
}

export async function listFaxes(options: ListFaxesOptions = {}): Promise<ListFaxesResponse> {
  const projectId = process.env.SINCH_PROJECT_ID;

  if (!projectId) {
    throw new Error("SINCH_PROJECT_ID not configured");
  }

  const params = new URLSearchParams();
  if (options.direction) params.append("direction", options.direction);
  if (options.status) params.append("status", options.status);
  if (options.to) params.append("to", options.to);
  if (options.from) params.append("from", options.from);
  if (options.createTimeAfter) params.append("createTime.after", options.createTimeAfter);
  if (options.createTimeBefore) params.append("createTime.before", options.createTimeBefore);
  if (options.pageSize) params.append("pageSize", options.pageSize.toString());
  if (options.pageToken) params.append("pageToken", options.pageToken);

  const url = `${SINCH_API_BASE}/projects/${projectId}/faxes?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Sinch API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

// Export auth header getter for webhook verification
export function getSinchAuthHeader(): string {
  return getAuthHeader();
}
