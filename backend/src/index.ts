import cors from "cors";
import express from "express";

import { config } from "./config";
import { infoMessages } from "./constants";
import { attachRequestId } from "./middleware";
import { router } from "./router";
import { connectDatabase } from "./service";

const app = express();

app.use(cors());
app.use(express.json({ limit: "256kb" }));
app.use(attachRequestId);
app.use(router);

const startServer = async (): Promise<void> => {
	await connectDatabase();

	app.listen(config.port, () => {
		console.log(`${infoMessages.serverStarted} on port ${config.port}`);
	});
};

void startServer();
