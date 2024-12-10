import multer from "multer";
import { multerConfig } from "../../configs/multer.js";

const storage = {
    avatar: multerConfig.avatarStorage
};

const fileFilter = {
    avatar: multerConfig.avatarFileFilter
};

const uploadAvatar = (filedName) =>
    multer({
        storage: storage[filedName],
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: fileFilter[filedName]
    });

const validateFile = (req, res, next) => {
    if (req.fileValidationError) {
        return next(req.fileValidationError); 
    }
    next();
};

export default { uploadAvatar, validateFile };
