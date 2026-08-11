const express = require('express');
const router = express.Router();
const { body, validationResult, param } = require('express-validator');
const videoController = require('../controllers/videoController');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Create video generation job
router.post('/', 
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('style').optional().isIn(['educational', 'entertainment', 'promotional']),
  handleValidationErrors,
  videoController.createVideo
);

// Get video by ID
router.get('/:id',
  param('id').isUUID().withMessage('Invalid video ID'),
  handleValidationErrors,
  videoController.getVideo
);

// List all videos with pagination
router.get('/',
  videoController.listVideos
);

// Get video download link
router.get('/:id/download',
  param('id').isUUID().withMessage('Invalid video ID'),
  handleValidationErrors,
  videoController.downloadVideo
);

// Cancel video job
router.delete('/:id',
  param('id').isUUID().withMessage('Invalid video ID'),
  handleValidationErrors,
  videoController.cancelVideo
);

// Get job status
router.get('/:id/status',
  param('id').isUUID().withMessage('Invalid video ID'),
  handleValidationErrors,
  videoController.getJobStatus
);

module.exports = router;
