import uploadFileService from "../services/uploadFileService.js";
import { logger } from "../utils/logger.js"

const awsUpload = (req, res) => {
    try {
        const { fileds, uploadedFiles } = uploadFileService.handleFileUpload(req, "image", "/image", "aws");

        logger.info(JSON.stringify({ fileds, uploadedFiles }));

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Upload succesfull",
            data: {
                fileds,
                uploadedFiles
            }
        });
    } catch (err) {
        logger.error("Error during AWS upload:" + err);
        throw err;
    }
};

const gcsUpload = (req, res) => {
    try {
        const { fileds, uploadedFiles } = uploadFileService.handleFileUpload(req, "image", "/image", "gcs");

        logger.info(JSON.stringify({ fileds, uploadedFiles }));

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Upload succesfull",
            data: {
                fileds,
                uploadedFiles
            }
        });
    } catch (err) {
        logger.error("Error during GCS upload:" + err);
        throw err;
    }
};

const publicUpload = (req, res) => {
    try {
        const { fileds, uploadedFiles } = uploadFileService.handleFileUpload(req, "image", "/image", "public");

        logger.info(JSON.stringify({ fileds, uploadedFiles }));

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Upload succesfull",
            data: {
                fileds,
                uploadedFiles
            }
        });
    } catch (err) {
        logger.error("Error during Public upload:" + err);
        throw err;
    }
};

export default { awsUpload, gcsUpload, publicUpload };
