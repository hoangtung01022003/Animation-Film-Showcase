-- Animation Film Showcase Database Schema
-- PostgreSQL Database for Render

-- Table: users (Người dùng)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: reviews (Đánh giá/Bình luận)
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: movie_stats (Thống kê phim - cache để tính nhanh)
CREATE TABLE IF NOT EXISTS movie_stats (
    id SERIAL PRIMARY KEY,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_5_stars INTEGER DEFAULT 0,
    total_4_stars INTEGER DEFAULT 0,
    total_3_stars INTEGER DEFAULT 0,
    total_2_stars INTEGER DEFAULT 0,
    total_1_star INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial stats record
INSERT INTO movie_stats (id, total_reviews, average_rating) 
VALUES (1, 0, 0.0) 
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Function to update movie stats automatically
CREATE OR REPLACE FUNCTION update_movie_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE movie_stats SET
        total_reviews = (SELECT COUNT(*) FROM reviews),
        average_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews),
        total_5_stars = (SELECT COUNT(*) FROM reviews WHERE rating = 5),
        total_4_stars = (SELECT COUNT(*) FROM reviews WHERE rating = 4),
        total_3_stars = (SELECT COUNT(*) FROM reviews WHERE rating = 3),
        total_2_stars = (SELECT COUNT(*) FROM reviews WHERE rating = 2),
        total_1_star = (SELECT COUNT(*) FROM reviews WHERE rating = 1),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats after INSERT/UPDATE/DELETE on reviews
DROP TRIGGER IF EXISTS trigger_update_stats ON reviews;
CREATE TRIGGER trigger_update_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH STATEMENT
EXECUTE FUNCTION update_movie_stats();