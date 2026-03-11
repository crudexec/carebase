"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = void 0;
const node_stream_1 = require("node:stream");
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const formidable = __importStar(require("formidable"));
const accessKeyId = process.env.MINIO_ACCESS_KEY;
const secretAccessKey = process.env.MINIO_SECRET_KEY;
const region = process.env.MINIO_REGION;
const Bucket = process.env.MINIO_BUCKET;
const endPoint = process.env.MINIO_ENDPOINT;
const parseFile = async (req) => {
    return new Promise((resolve, reject) => {
        const options = {
            maxFileSize: 100 * 1024 * 1024,
            allowEmptyFiles: false,
        };
        const form = new formidable.IncomingForm(options);
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            form.emit('file', { name: 'Uploading', value: 'File is being uploaded' });
        });
        form.on('data', (data) => {
            if (data.name === 'successUpload') {
                resolve(data.value);
            }
        });
        form.on('fileBegin', (formName, file) => {
            file.open = async function () {
                this._writeStream = new node_stream_1.Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk);
                    },
                });
                this._writeStream.on('error', (e) => {
                    form.emit('error', e);
                });
                new lib_storage_1.Upload({
                    client: new client_s3_1.S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey,
                        },
                        endpoint: endPoint,
                        region,
                        forcePathStyle: true,
                        tls: false,
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        Key: `${Date.now().toString()}-${this.originalFilename}`,
                        ContentType: this.originalFilename.includes('.svg') ? 'image/svg+xml' : this.type,
                        Body: this._writeStream,
                    },
                    tags: [],
                    queueSize: 4,
                    partSize: 1024 * 1024 * 5,
                    leavePartsOnError: false,
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
exports.parseFile = parseFile;
//# sourceMappingURL=fileParser.js.map