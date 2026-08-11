const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../models/database');
const logger = require('../utils/logger');
const axios = require('axios');

class VideoController {
  async createVideo(req, res, next) {
    try {
      const { topic, style = 'entertainment' } = req.body;
      const videoId = uuidv4();

      // Insert video record
      await run(
        `INSERT INTO videos (id, topic, status, metadata) 
         VALUES (?, ?, ?, ?)`,
        [videoId, topic, 'pending', JSON.stringify({ style })]
      );

      // Create job record
      const jobId = uuidv4();
      await run(
        `INSERT INTO jobs (id, video_id, job_type, status) 
         VALUES (?, ?, ?, ?)`,
        [jobId, videoId, 'script_generation', 'pending']
      );

      logger.info(`Video creation requested: ${videoId} with topic: ${topic}`);

      res.status(201).json({
        id: videoId,
        jobId,
        status: 'pending',
        message: 'Video generation started'
      });
    } catch (error) {
      logger.error('Error creating video:', error);
      next(error);
    }
  }

  async getVideo(req, res, next) {
    try {
      const { id } = req.params;
      const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      res.json({
        ...video,
        metadata: video.metadata ? JSON.parse(video.metadata) : {}
      });
    } catch (error) {
      logger.error('Error fetching video:', error);
      next(error);
    }
  }

  async listVideos(req, res, next) {
    try {
      const page = Math.max(1, parseInt(req.query.page || 1));
      const limit = Math.min(50, parseInt(req.query.limit || 10));
      const offset = (page - 1) * limit;

      const videos = await all(
        `SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const countResult = await get('SELECT COUNT(*) as count FROM videos');
      const total = countResult.count;

      res.json({
        videos: videos.map(v => ({
          ...v,
          metadata: v.metadata ? JSON.parse(v.metadata) : {}
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error listing videos:', error);
      next(error);
    }
  }

  async downloadVideo(req, res, next) {
    try {
      const { id } = req.params;
      const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (video.status !== 'completed') {
        return res.status(400).json({ 
          error: 'Video not ready for download',
          status: video.status
        });
      }

      if (!video.output_path) {
        return res.status(400).json({ error: 'No output file available' });
      }

      logger.info(`Video download requested: ${id}`);
      res.json({
        downloadUrl: `/api/videos/${id}/file`,
        outputPath: video.output_path,
        duration: video.duration
      });
    } catch (error) {
      logger.error('Error downloading video:', error);
      next(error);
    }
  }

  async cancelVideo(req, res, next) {
    try {
      const { id } = req.params;
      const video = await get('SELECT * FROM videos WHERE id = ?', [id]);

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      if (['completed', 'failed', 'cancelled'].includes(video.status)) {
        return res.status(400).json({ 
          error: `Cannot cancel video with status: ${video.status}` 
        });
      }

      await run('UPDATE videos SET status = ?, updated_at = ? WHERE id = ?', 
        ['cancelled', new Date().toISOString(), id]);

      logger.info(`Video cancelled: ${id}`);
      res.json({ message: 'Video cancelled successfully' });
    } catch (error) {
      logger.error('Error cancelling video:', error);
      next(error);
    }
  }

  async getJobStatus(req, res, next) {
    try {
      const { id } = req.params;
      const jobs = await all('SELECT * FROM jobs WHERE video_id = ?', [id]);

      if (jobs.length === 0) {
        return res.status(404).json({ error: 'No jobs found for video' });
      }

      res.json({
        jobs: jobs.map(job => ({
          ...job,
          result: job.result ? JSON.parse(job.result) : null
        }))
      });
    } catch (error) {
      logger.error('Error fetching job status:', error);
      next(error);
    }
  }
}

module.exports = new VideoController();
