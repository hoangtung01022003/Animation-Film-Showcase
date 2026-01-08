const { Pool } = require('pg');
require('dotenv').config();

// Cấu hình kết nối PostgreSQL cho Render
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false // Render yêu cầu setting này
    } : false,
    // Connection pool settings
    max: 20, // Số kết nối tối đa
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection và log
pool.on('connect', () => {
    console.log('✅ Đã kết nối thành công tới PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Lỗi kết nối database:', err.message);
    // Không exit process để Render có thể retry
});

// Test query khi khởi động (không blocking)
pool.query('SELECT NOW()')
    .then(res => {
        console.log('✅ Database query test successful:', res.rows[0].now);
    })
    .catch(err => {
        console.error('❌ Database query test failed:', err.message);
        console.log('⚠️  Server sẽ tiếp tục chạy, nhưng cần kiểm tra DATABASE_URL trong file .env');
    });

module.exports = pool;