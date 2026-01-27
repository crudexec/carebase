import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ?? "";
export const region = process.env.S3_UPLOAD_REGION ?? "ca-central-1";
const bucket = process.env.S3_UPLOAD_BUCKET_NAME ?? "altoheal";

const s3 = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
});

/**
 *
 * @param fileName unique identifier for file
 * @returns S3 signed URL
 */
export const getSignedURL = async (
  fileName: string,
  providerId: string,
  fileType: string,
  expiry?: number,
) => {
  const bucketParams = new PutObjectCommand({
    Bucket: bucket,
    Key: `${providerId}/${fileName}`,
    ContentType: fileType,
  });

  const imageUrl = await getSignedUrl(s3, bucketParams, {
    expiresIn: Number(process.env.S3_UPLOAD_PRESIGNED_EXPIRES) || expiry,
  });
  return imageUrl;
};

export const getObjectURL = async (fileName: string, expiry?: number) => {
  const bucketParams = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  const imageUrl = await getSignedUrl(s3, bucketParams, {
    expiresIn: Number(process.env.S3_GET_PRESIGNED_EXPIRES) || expiry,
  });
  return imageUrl;
};

/**
 *
 * @param fileName id of file you want to delete
 */
export const deleteMedia = async (fileName: string, providerId: string) => {
  const bucketParams = {
    Bucket: bucket,
    Key: `${providerId}/${fileName}`,
  };
  return await s3.send(new DeleteObjectCommand(bucketParams));
};
