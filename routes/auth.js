const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Tên đăng nhập phải từ 3-50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('full_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Họ tên tối đa 100 ký tự')
];

const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên đăng nhập hoặc email'),
    body('password')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;