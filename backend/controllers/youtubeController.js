const axios = require('axios');
require('dotenv').config();

exports.getPlaylistItems = async (req, res) => {
  try {
    const { playlistId, part, maxResults } = req.query;

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        message: 'El parámetro playlistId es requerido'
      });
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: part || 'snippet',
        maxResults: maxResults || 20,
        playlistId,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    res.json({
      items: response.data.items.map(item => ({
        id: item.id,
        snippet: {
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          resourceId: item.snippet.resourceId
        }
      }))
    });

  } catch (error) {
    console.error('Error en YouTube API:', {
      error: error.response?.data || error.message,
      queryParams: req.query
    });
    
    const status = error.response?.status || 500;
    res.status(status).json({
      success: false,
      message: 'Error al obtener videos de YouTube',
      error: error.response?.data || error.message
    });
  }
};