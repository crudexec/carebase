import axios from "axios";
import toast from "react-hot-toast";

import { generateUUID } from "./utils";

type ObjectType = "users" | "forms";

const getFileMeta = (file: File, ext?: string) => {
  const fileName = file.name;
  const extension = fileName?.split(".").pop() || ext;
  return { extension, mimeType: file.type };
};

const uploadFile = async (file: File, objectType: ObjectType, ext?: string) => {
  const myUUID = generateUUID();
  const meta = getFileMeta(file, ext);
  const mediaId = `${objectType}/${myUUID}.${meta.extension}`;
  const newFile = new File([file], objectType, { type: meta.mimeType });

  const response = await axios.post("/api/file/upload", {
    fileName: mediaId,
    fileType: meta.mimeType,
  });

  try {
    if (response.data && response.data.data.preSignedUrl) {
      await axios.put(response.data.data.preSignedUrl, newFile, {
        headers: {
          "Content-Type": file.type,
        },
      });
    }
    return {
      preSignedUrl: response.data.data.preSignedUrl,
      mediaId,
      success: true,
    };
  } catch (error) {
    toast.error(
      error?.response?.data?.message ??
        error?.message ??
        "Error uploading file",
    );
    return { success: false };
  }
};

export { getFileMeta, uploadFile };
