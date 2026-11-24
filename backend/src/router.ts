import { Router } from "express";

import { getBootstrap, getHealth, getTime, postDeviceRegister } from "./controllers";
import { requireDevice } from "./middleware";
import { devicesValidator, validateRequest } from "./validators";

export const router = Router();

router.get("/health", getHealth);
router.get("/v1/time", getTime);
router.post("/v1/devices/register", ...devicesValidator.register, validateRequest, postDeviceRegister);
router.get("/v1/bootstrap", requireDevice, getBootstrap);
