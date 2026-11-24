import { Router } from "express";

import {
	getBootstrap,
	getHealth,
	getProgress,
	getQuiz,
	getQuizAttempt,
	getQuizAttemptResultHandler,
	getResults,
	getStories,
	getStory,
	getStoryMain,
	getTime,
	patchSettings,
	postDeviceRegister,
	postQuizAnswer,
	postQuizAttempt,
	postTimingAttempt,
	putStoryProgress,
} from "./controllers";
import { rateLimitAnswers, rateLimitRead, rateLimitRegister, requireDevice } from "./middleware";
import {
	devicesValidator,
	progressValidator,
	quizAttemptsValidator,
	quizzesValidator,
	storiesValidator,
	timingAttemptsValidator,
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
router.post(
	"/v1/quizzes/:id/attempt",
	requireDevice,
	rateLimitRead,
	...quizAttemptsValidator.create,
	validateRequest,
	postQuizAttempt,
);

router.get(
	"/v1/me/quiz-attempts/:id",
	requireDevice,
	rateLimitRead,
	...quizAttemptsValidator.byId,
	validateRequest,
	getQuizAttempt,
);
router.post(
	"/v1/me/quiz-attempts/:id/answers",
	requireDevice,
	rateLimitAnswers,
	...quizAttemptsValidator.answer,
	validateRequest,
	postQuizAnswer,
);
router.get(
	"/v1/me/quiz-attempts/:id/result",
	requireDevice,
	rateLimitRead,
	...quizAttemptsValidator.byId,
	validateRequest,
	getQuizAttemptResultHandler,
);
router.get(
	"/v1/me/results",
	requireDevice,
	rateLimitRead,
	...quizAttemptsValidator.results,
	validateRequest,
	getResults,
);
router.post(
	"/v1/me/timing-attempts",
	requireDevice,
	rateLimitRead,
	...timingAttemptsValidator.create,
	validateRequest,
	postTimingAttempt,
);

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
