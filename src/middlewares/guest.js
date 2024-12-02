import errorAPI from "../utils/errorAPI";
import httpStatus from "http-status";

const guest = (req, res, next) => {
    if(req.headers.authorization) {
        return next(new errorAPI(httpStatus[httpStatus.BAD_REQUEST], httpStatus.BAD_REQUEST));
    }

    next();
}

export default guest;