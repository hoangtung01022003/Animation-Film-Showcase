const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục!'
            });
        }

        const token = authHeader.substring(7); // Bỏ "Bearer "

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin user vào request
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ!'
        });
    }
};

module.exports = authMiddleware;