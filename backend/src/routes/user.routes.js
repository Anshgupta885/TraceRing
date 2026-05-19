const { Router } = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { getUserAnalysisStats } = require('../services/analysisService');

const router = Router();

router.get('/user/results', authenticateToken, async (req, res) => {
  try {
    const resultsStats = await getUserAnalysisStats(req.user.id);
    return res.status(200).json({
      success: true,
      data: resultsStats,
    });
  } catch (error) {
    console.error('User results error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load user results',
    });
  }
});

module.exports = router;
