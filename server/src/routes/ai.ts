import { Router, Request, Response } from 'express';
import { performAIDiagnosis, analyzeBreakdownImage, getAIAssistantResponse } from '../services/aiService';

const router = Router();

// Diagnose breakdown
router.post('/diagnose', (req: Request, res: Response) => {
  const { problemType, description, vehicleType, vehicleMake, vehicleModel, imageDataUri } = req.body;

  if (!problemType || !vehicleType) {
    return res.status(400).json({ success: false, message: 'problemType and vehicleType are required' });
  }

  const diagnosis = performAIDiagnosis({
    problemType,
    description: description || '',
    vehicleType,
    vehicleMake,
    vehicleModel,
    imageDataUri
  });

  res.json({ success: true, diagnosis });
});

// Image-based damage analysis
router.post('/image-analysis', (req: Request, res: Response) => {
  const { imageDataUri, problemHint } = req.body;

  if (!imageDataUri) {
    return res.status(400).json({ success: false, message: 'imageDataUri is required' });
  }

  const result = analyzeBreakdownImage(imageDataUri, problemHint);
  res.json({ success: true, analysis: result });
});

// Interactive vehicle assistant
router.post('/assistant', (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query string is required' });
  }

  const response = getAIAssistantResponse(query);
  res.json({ success: true, response });
});

export default router;
