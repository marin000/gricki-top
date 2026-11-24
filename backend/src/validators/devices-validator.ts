import { body } from "express-validator";

export const devicesValidator = {
	register: [
		body("deviceId").isUUID(),
		body("token").isString().isLength({ min: 32, max: 512 }),
		body("platform").isIn(["ios", "android"]),
		body("appVersion").isString().isLength({ min: 1, max: 32 }),
		body("locale").isString().isLength({ min: 2, max: 16 }),
	],
};
