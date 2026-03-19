const express = require('express');
const router = express.Router({ mergeParams: true });

const { isAuthenticated, requireRole } = require('../../middleware/auth');
const {
  listTests,
  getTest,
  createTest,
  updateTest,
  deleteTest
} = require('../../controllers/api/tests.controller');

router.get('/', isAuthenticated, listTests);
router.get('/:id', isAuthenticated, getTest);
router.post('/', isAuthenticated, requireRole('profesor'), createTest);
router.put('/:id', isAuthenticated, requireRole('profesor'), updateTest);
router.delete('/:id', isAuthenticated, requireRole('profesor'), deleteTest);

module.exports = router;
