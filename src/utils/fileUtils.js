import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const listMimeType = {
    image: ["image/jpeg", "image/jpg", "image/png"],
    document: ["application/pdf"]
};

const generateFilename = (ext) => {
    const uniqueFileName = uuidv4();
    return `${env.APP_NAME.toLowerCase().replace(/\s+/g, "-")}-${uniqueFileName}.${ext}`;
};

const validateMimeType = (type, mimetype) => {
    if (!listMimeType[type].includes(mimetype)) {
        throw new Error("Invalid file type");
    }
};

export default { ensureDirectoryExists, generateFilename, validateMimeType };

