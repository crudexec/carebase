import { API_BASE_URL } from "@/constants";

export const approveVisit = async (
  token: string,
  visitId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/visit/${visitId}/approve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const sendVisitReview = async (
  token: string,
  visitId: string,
  review_notes: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/visit/${visitId}/review`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review_notes }),
    });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};
