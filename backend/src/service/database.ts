import mongoose from "mongoose";

import { config } from "../config";
import { infoMessages } from "../constants";

export const connectDatabase = async (): Promise<void> => {
	try {
		await mongoose.connect(config.mongodbUri, {
			dbName: config.mongodbDbName,
			maxPoolSize: 5,
		});
		console.log(infoMessages.databaseConnected);
	} catch (error) {
		console.error(infoMessages.databaseFailed, error);
		throw error;
	}
};
