const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Đánh giá phải từ 1-5 sao'),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập nội dung đánh giá')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Nội dung đánh giá phải từ 10-1000 ký tự')
];

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/stats', reviewController.getMovieStats);

// Protected routes (cần đăng nhập)
router.post('/', authMiddleware, reviewValidation, reviewController.createReview);
router.put('/:id', authMiddleware, reviewValidation, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;