import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import env from "./env.js";
import errorAPI from "../src/utils/errorAPI.js";
import path from "path";

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.resolve("public/images/avatar");
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueFileName = uuidv4();
        cb(null, env.APP_NAME.split(" ").join("-") + "-" + uniqueFileName + path.extname(file.originalname));
    }
});

const avatarFileFilter = (req, file, cb) => {
    const allowedMimeType = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimeType.includes(file.mimetype)) {
        cb(null, true);
    } else {
        req.fileValidationError = new errorAPI("Invalid mime type", 415, ["Unsupported media type"]);
        cb(null, false);
    }
};

export const multerConfig = {
    avatarStorage,
    avatarFileFilter
};
