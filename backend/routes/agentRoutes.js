import express from 'express';
import {
  planAutonomousGoal,
  diagnoseProblem,
  reserveMultiStorePlan,
} from '../controllers/agentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/plan-goal', planAutonomousGoal);
router.post('/diagnose-problem', diagnoseProblem);
router.post('/reserve-multi-plan', protect, reserveMultiStorePlan);

export default router;
