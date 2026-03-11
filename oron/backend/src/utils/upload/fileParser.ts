import { Transform } from 'node:stream';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import * as formidable from 'formidable';

const accessKeyId = process.env.MINIO_ACCESS_KEY;
const secretAccessKey = process.env.MINIO_SECRET_KEY;
const region = process.env.MINIO_REGION;
const Bucket = process.env.MINIO_BUCKET;
const endPoint = process.env.MINIO_ENDPOINT;

export const parseFile = async (req: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const options = {
      maxFileSize: 100 * 1024 * 1024,
      allowEmptyFiles: false,
    };
    const form = new formidable.IncomingForm(options);

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        reject(err);
      }
      form.emit('file', { name: 'Uploading', value: 'File is being uploaded' });
    });
    form.on('data', (data: any) => {
      if (data.name === 'successUpload') {
        resolve(data.value);
      }
    });

    form.on('fileBegin', (formName, file) => {
      file.open = async function () {
        this._writeStream = new Transform({
          transform(chunk, encoding, callback) {
            callback(null, chunk);
          },
        });

        this._writeStream.on('error', (e) => {
          form.emit('error', e);
        });

        new Upload({
          client: new S3Client({
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            endpoint: endPoint, // MinIO endpoint with default port
            region,
            forcePathStyle: true,
            // Required for MinIO
            tls: false,
            // If you're using a self-signed certificate
            // tls: {
            //   rejectUnauthorized: false
            // }
          }),
          params: {
            ACL: 'public-read',
            Bucket,
            Key: `${Date.now().toString()}-${this.originalFilename}`,
            ContentType: this.originalFilename.includes('.svg') ? 'image/svg+xml' : this.type,

            Body: this._writeStream,
          },
          tags: [], // optional tags
          queueSize: 4, // optional concurrency configuration
          partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
          leavePartsOnError: false, // optional manually handle dropped parts
        })
          .done()
          .then((data) => {
            form.emit('data', { name: 'complete', value: data });
            resolve(data.Location);
          })
          .catch((err) => {
            form.emit('error', err);
          });
      };
    });
  });
};
