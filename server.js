const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Cho phép frontend gọi API
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.CLIENT_URL || '*'
        : '*',
    credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
});

// Health check endpoint cho Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// API Routes - Load với error handling
try {
    console.log('📂 Loading routes from:', __dirname);
    const authRoutes = require('./routes/auth');
    const reviewRoutes = require('./routes/reviews');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/reviews', reviewRoutes);
    
    console.log('✅ Routes loaded successfully:');
    console.log('   - /api/auth/*');
    console.log('   - /api/reviews/*');
} catch (error) {
    console.error('❌ ERROR loading routes:', error.message);
    console.error('Stack:', error.stack);
    
    // Fallback routes nếu load routes thất bại
    app.all('/api/*', (req, res) => {
        res.status(500).json({
            success: false,
            message: 'Server configuration error',
            error: error.message
        });
    });
}

// Serve static files - ĐẶT SAU API routes
app.use(express.static(path.join(__dirname), { 
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0 
}));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

// Serve index.html cho tất cả các routes không phải API (SPA routing)
// PHẢI ĐẶT CUỐI CÙNG
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({ 
        success: false, 
        message: process.env.NODE_ENV === 'production' 
            ? 'Có lỗi xảy ra trên server!' 
            : err.message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server đang chạy tại PORT: ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log('='.repeat(50));
});