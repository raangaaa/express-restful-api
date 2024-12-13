import formidable from "formidable";
import AWS from "aws-sdk";
import { Storage } from "@google-cloud/storage";
import path from "path";
import env from "../../configs/env.js";
import errorAPI from "../utils/errorAPI";
import fileUtils from "../utils/fileUtils.js";

const storage = new Storage();
const bucketName = env.GCS_BUCKET_NAME;

const s3 = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION
});

const formidableOptions = {
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024
};

const handleError = (err, reject) => {
    reject(new errorAPI("File upload error", 400, [err.message]));
};

/**
 * Upload file to local storage or cloud (AWS/GCS).
 * @param {Object} req - Request from Express.
 * @param {String} type - Category file (example: "image", "document").
 * @param {String} directory - Directory file to save.
 * @param {String} storageType - Type storage ("aws", "gcs", "public").
 * @returns {Promise<Object>} - URL file or local path.
 */

const handleFileUpload = (req, type, directory = "uploads", storageType) => {
    return new Promise((resolve, reject) => {
        const uploadedFiles = [];   
        storageType = storageType.toLowerCase();
        const uploadDir = path.join("public", directory.toLowerCase());
        if (storageType.toLowerCase() === "public") {
            fileUtils.ensureDirectoryExists(uploadDir);
        }

        const form = formidable(
            storageType.toLowerCase() === "public"
                ? {
                      uploadDir,
                      ...formidableOptions,
                      filename: (name, ext, part, form) => fileUtils.generateFilename(part.mimetype.split("/")[1])
                  }
                : formidableOptions
        );

        form.onPart = (part) => {
            try {
                if (part.originalFilename && part.mimetype) {
                    fileUtils.validateMimeType(type, part.mimetype);
                    if (storageType !== "public") {
                        uploadFileToCloud(directory, storageType, part, part.mimetype)
                            .then((url) => {
                                uploadedFiles.push(url);
                            })
                            .catch((err) => handleError(err, reject));
                    }
                }
            } catch (err) {
                handleError(err, reject);
            }
        };

        form.on("error", (err) => {
            if (err.message.includes("maxFiles")) {
                handleError(new Error("The number of files uploaded exceeds the maximum limit."), reject);
            } else if (err.message.includes("maxFileSize")) {
                handleError(new Error("Max size file is 10mb."), reject);
            } else {
                handleError(err, reject)
            }
        });

        form.parse(req, (err, fields, files) => {
            if (err) return handleError(err, reject);
            resolve({ fields, uploadedFiles });
        });
    });
};

const uploadFileToCloud = (directory, storageType, fileStream, mimetype) => {
    const filename = `${directory}/${fileUtils.generateFilename(mimetype.split("/")[1])}`;

    if (storageType.toLowerCase() === "aws") {
        return s3
            .upload({
                Bucket: env.AWS_BUCKET_NAME,
                Key: filename,
                Body: fileStream,
                ContentType: mimetype
            })
            .promise();
    } else if (storageType.toLowerCase() === "gcs") {
        const blob = storage.bucket(bucketName).file(filename);
        const blobStream = blob.createWriteStream({
            resumable: true,
            contentType: mimetype,
            predefinedAcl: "publicRead"
        });

        return new Promise((resolve, reject) => {
            fileStream
                .pipe(blobStream)
                .on("error", (err) => {
                    blob.delete().catch(() => {});
                    reject(err);
                })
                .on("finish", () => resolve(`https://storage.googleapis.com/${bucketName}/${filename}`));
        });
    }
};


export default { handleFileUpload };