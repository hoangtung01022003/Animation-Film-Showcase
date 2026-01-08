const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Lấy tất cả reviews
exports.getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = 'newest' } = req.query;
        const offset = (page - 1) * limit;

        let orderBy = 'r.created_at DESC';
        if (sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
        else if (sort === 'lowest') orderBy = 'r.rating ASC, r.created_at DESC';

        const reviews = await pool.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
                    u.id as user_id, u.username, u.full_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             ORDER BY ${orderBy}
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const totalCount = await pool.query('SELECT COUNT(*) FROM reviews');

        res.json({
            success: true,
            reviews: reviews.rows,
            pagination: {
                total: parseInt(totalCount.rows[0].count),
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalCount.rows[0].count / limit)
            }
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đánh giá!'
        });
    }
};

// Tạo review mới
exports.createReview = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Kiểm tra user đã review chưa
        const existingReview = await pool.query(
            'SELECT * FROM reviews WHERE user_id = $1',
            [userId]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá phim này rồi! Vui lòng cập nhật đánh giá cũ.'
            });
        }

        // Tạo review mới
        const newReview = await pool.query(
            `INSERT INTO reviews (user_id, rating, comment) 
             VALUES ($1, $2, $3) 
             RETURNING id, rating, comment, created_at`,
            [userId, rating, comment]
        );

        // Lấy thông tin user
        const user = await pool.query(
            'SELECT username, full_name FROM users WHERE id = $1',
            [userId]
        );

        res.status(201).json({
            success: true,
            message: 'Đánh giá của bạn đã được gửi thành công!',
            review: {
                ...newReview.rows[0],
                user_id: userId,
                username: user.rows[0].username,
                full_name: user.rows[0].full_name
            }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đánh giá!'
        });
    }
};

// Cập nhật review
exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        // Kiểm tra review có tồn tại và thuộc về user không
        const review = await pool.query(
            'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (review.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa!'
            });
        }

        // Cập nhật review
        const updatedReview = await pool.query(
            `UPDATE reviews 
             SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [rating, comment, id]
        );

        res.json({
            success: true,
            message: 'Cập nhật đánh giá thành công!',
            review: updatedReview.rows[0]
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật đánh giá!'
        });
    }
};

// Xóa review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Kiểm tra review có tồn tại và thuộc về user không
        const review = await pool.query(
            'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (review.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa!'
            });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Xóa đánh giá thành công!'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa đánh giá!'
        });
    }
};

// Lấy thống kê phim
exports.getMovieStats = async (req, res) => {
    try {
        const stats = await pool.query('SELECT * FROM movie_stats WHERE id = 1');

        res.json({
            success: true,
            stats: stats.rows[0]
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê!'
        });
    }
};