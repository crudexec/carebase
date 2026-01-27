import axios from "axios";
import toast from "react-hot-toast";

export const createRequest = async <T>(url: string, arg: T) => {
  try {
    const resp = await axios.post(url, arg);
    return resp.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.message ?? error.message ?? "An error occurred",
    );
  }
};

export const updateRequest = async <T>(url: string, arg: T) => {
  try {
    const resp = await axios.put(url, arg);
    return resp.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.message ?? error.message ?? "An error occurred",
    );
  }
};

export const deleteRequest = async <T>(url: string, arg: T) => {
  try {
    const resp = await axios.delete(url, { data: arg });
    return resp.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.message ?? error.message ?? "An error occurred",
    );
  }
};
