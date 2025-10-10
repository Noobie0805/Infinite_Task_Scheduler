import { Router } from 'express';
import { createCommonTask, getCommonTasks, getEffectiveSlots } from '../controllers/commonSlots.controller.js';
import { createExceptionTask, getExceptionTasksByDate } from '../controllers/exceptionSlots.controller.js';
import { validateCreateCommonTask, validateCreateExceptionTask } from '../middlewares/validation.js';

const router = Router();

// Common tasks routes
router.post('/api/create-common-tasks', validateCreateCommonTask, createCommonTask);
router.get('/api/get-common-tasks', getCommonTasks);
router.get('/api/get-effective-slots', getEffectiveSlots);

// Exception tasks routes
router.post('/api/create-exception-tasks', validateCreateExceptionTask, createExceptionTask);
router.get('/api/get-exception-tasks', getExceptionTasksByDate);

export default router;


