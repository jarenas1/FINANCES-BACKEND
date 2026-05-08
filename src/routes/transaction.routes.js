const router = require('express').Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getChartData,
  getCategoryBreakdown
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');


router.get('/summary', protect, getSummary);
router.get('/chart', protect, getChartData);
router.get('/categories-breakdown', protect, getCategoryBreakdown);

//crud
router.get('/', protect, getTransactions);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
