import fs from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Ensures that a directory exists. If it doesn't, it creates the directory recursively.
 * @param {String} dir - The directory path to check and create if it doesn't exist.
 */
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const listMimeType = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    document: ["application/pdf"]
};

/**
 * Generates a unique filename with the specified extension, prefixed by the app's name.
 * @param {String} ext - The file extension for the generated filename.
 * @returns {String} - A unique filename.
 */
const generateFilename = (ext) => {
    const uniqueFileName = uuidv4();
    return `${env.APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${uniqueFileName}.${ext}`;
};

/**
 * Validates if the given MIME type is allowed for the specified file category.
 * @param {String} type - The file category (e.g., "image", "document").
 * @param {String} mimetype - The MIME type of the file to validate.
 * @throws {Error} Throws an error if the MIME type is not valid for the category.
 */
const validateMimeType = (type, mimetype) => {
    if (!listMimeType[type].includes(mimetype)) {
        throw new Error("Invalid file type");
    }
};

export default { ensureDirectoryExists, generateFilename, validateMimeType };

