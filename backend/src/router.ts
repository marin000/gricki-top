import { Router } from "express";

import {
	getBootstrap,
	getHealth,
	getProgress,
	getQuiz,
	getStories,
	getStory,
	getStoryMain,
	getTime,
	patchSettings,
	postDeviceRegister,
	putStoryProgress,
} from "./controllers";
import { rateLimitRead, rateLimitRegister, requireDevice } from "./middleware";
import {
	devicesValidator,
	progressValidator,
	quizzesValidator,
	storiesValidator,
	validateRequest,
} from "./validators";

export const router = Router();

router.get("/health", getHealth);
router.get("/v1/time", getTime);
router.post(
	"/v1/devices/register",
	rateLimitRegister,
	...devicesValidator.register,
	validateRequest,
	postDeviceRegister,
);

router.get("/v1/bootstrap", requireDevice, rateLimitRead, getBootstrap);

router.get("/v1/stories", requireDevice, rateLimitRead, ...storiesValidator.list, validateRequest, getStories);
router.get("/v1/stories/main", requireDevice, rateLimitRead, getStoryMain);
router.get("/v1/stories/:id", requireDevice, rateLimitRead, ...storiesValidator.byId, validateRequest, getStory);

router.get("/v1/quizzes/:id", requireDevice, rateLimitRead, ...quizzesValidator.byId, validateRequest, getQuiz);

router.put(
	"/v1/me/story-progress/:storyId",
	requireDevice,
	rateLimitRead,
	...progressValidator.storyProgress,
	validateRequest,
	putStoryProgress,
);
router.get("/v1/me/progress", requireDevice, rateLimitRead, getProgress);
router.patch(
	"/v1/me/settings",
	requireDevice,
	rateLimitRead,
	...progressValidator.settings,
	validateRequest,
	patchSettings,
);
