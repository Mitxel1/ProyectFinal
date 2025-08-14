const express = require('express');
const router = express.Router();
const axios = require('axios');
const { check, validationResult } = require('express-validator');

// Middleware para validar parámetros
const validatePlaylistRequest = [
  check('playlistId').notEmpty().isString(),
  check('part').default('snippet').isString(),
  check('maxResults').default(20).isInt({ min: 1, max: 50 })
];

router.get('/playlistItems', validatePlaylistRequest, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { playlistId, part, maxResults } = req.query;
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        playlistId,
        part,
        maxResults,
        key: process.env.YOUTUBE_API_KEY
      },
      headers: {
        'Referer': req.headers.origin || 'http://localhost:4200',
        'Accept': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('YouTube API error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.error?.message || 'Error al obtener videos de YouTube';
    
    res.status(statusCode).json({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.response?.data : undefined
    });
  }
});

module.exports = router;