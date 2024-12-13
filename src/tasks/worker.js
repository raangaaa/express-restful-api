import { Worker } from "worker_threads";
import { logger } from "../utils/logger.js";

const startWorker = (data, targerFileName) => {
    const worker = new Worker(`./workers/${targerFileName}`, {
        workerData: { ...data }
    });

    worker.on("message", (result) => logger.info(`${result}`));

    worker.on("error", (err) => logger.error(`${err}`));

    worker.on("exit", (code) => {
        if (code !== 0) {
            logger.info(`Worker stop with code ${code}`);
        }
    });
};

export default startWorker;
