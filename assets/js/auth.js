// API Configuration - Tự động detect môi trường
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api' 
    : `${window.location.origin}/api`; // Production sử dụng cùng domain

console.log('🔗 API URL:', API_URL);

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const removeUser = () => localStorage.removeItem('user');

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Update UI based on auth state
function updateAuthUI() {
    const user = getUser();
    const userMenu = document.getElementById('userMenu');
    const guestMenu = document.getElementById('guestMenu');
    const userName = document.getElementById('userName');
    
    if (user) {
        userMenu.style.display = 'block';
        guestMenu.style.display = 'none';
        userName.textContent = user.full_name || user.username;
    } else {
        userMenu.style.display = 'none';
        guestMenu.style.display = 'block';
    }
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            updateAuthUI();
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showAlert('Đăng nhập thành công!', 'success');
            loadReviews(); // Reload reviews
        } else {
            showAlert(data.message || 'Đăng nhập thất bại!', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Lỗi kết nối server!', 'danger');
    }
});

// Register
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                full_name: formData.get('full_name')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            updateAuthUI();
            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
            showAlert('Đăng ký thành công!', 'success');
            loadReviews();
        } else {
            showAlert(data.message || 'Đăng ký thất bại!', 'danger');
        }
    } catch (error) {
        console.error('Register error:', error);
        showAlert('Lỗi kết nối server!', 'danger');
    }
});

// Logout
function logout() {
    removeToken();
    removeUser();
    updateAuthUI();
    showAlert('Đã đăng xuất thành công!', 'info');
    loadReviews();
}

// Open review modal
function openReviewModal() {
    if (!getToken()) {
        showAlert('Vui lòng đăng nhập để viết đánh giá!', 'warning');
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        authModal.show();
        return;
    }
    
    const reviewModal = new bootstrap.Modal(document.getElementById('reviewModal'));
    reviewModal.show();
}

// Star rating functionality
const starRating = document.getElementById('starRating');
const ratingInput = document.getElementById('ratingInput');

if (starRating) {
    const stars = starRating.querySelectorAll('i');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingInput.value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#ffc107';
                } else {
                    s.style.color = '#555';
                }
            });
        });
    });
    
    starRating.addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingInput.value);
        stars.forEach((s, index) => {
            if (index < currentRating) {
                s.style.color = '#ffc107';
            } else {
                s.style.color = '#555';
            }
        });
    });
    
    // Set default 5 stars
    stars.forEach(s => s.classList.add('active'));
}

// Submit review
document.getElementById('reviewForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment')
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
            showAlert('Đánh giá của bạn đã được gửi thành công!', 'success');
            e.target.reset();
            document.querySelectorAll('#starRating i').forEach(s => s.classList.add('active'));
            loadReviews();
            loadStats();
        } else {
            showAlert(data.message || 'Gửi đánh giá thất bại!', 'danger');
        }
    } catch (error) {
        console.error('Submit review error:', error);
        showAlert('Lỗi kết nối server!', 'danger');
    }
});

// Load reviews
async function loadReviews(page = 1) {
    try {
        const response = await fetch(`${API_URL}/reviews?page=${page}&limit=6`);
        const data = await response.json();
        
        if (data.success) {
            displayReviews(data.reviews);
            displayPagination(data.pagination);
        }
    } catch (error) {
        console.error('Load reviews error:', error);
    }
}

// Display reviews
function displayReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-white-50">
                <i class="bi bi-chat-dots fs-1 mb-3 d-block"></i>
                <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const initial = (review.full_name || review.username).charAt(0).toUpperCase();
        const colors = ['bg-danger', 'bg-primary', 'bg-success', 'bg-warning', 'bg-info'];
        const bgColor = colors[review.user_id % colors.length];
        
        return `
            <div class="col-md-6">
                <div class="card bg-secondary bg-opacity-10 border-start border-danger border-3 text-white h-100 review-item">
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-3">
                            <div class="d-flex align-items-center">
                                <div class="avatar ${bgColor} text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style="width:32px; height:32px">${initial}</div>
                                <h6 class="card-title mb-0 fw-bold">${review.full_name || review.username}</h6>
                            </div>
                            <div class="text-warning small">${stars}</div>
                        </div>
                        <p class="card-text small text-light opacity-75">"${review.comment}"</p>
                        <small class="text-muted">${new Date(review.created_at).toLocaleDateString('vi-VN')}</small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display pagination
function displayPagination(pagination) {
    const container = document.getElementById('reviewsPagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<nav><ul class="pagination justify-content-center">';
    
    for (let i = 1; i <= pagination.pages; i++) {
        paginationHTML += `
            <li class="page-item ${i === pagination.page ? 'active' : ''}">
                <a class="page-link bg-dark text-${i === pagination.page ? 'danger' : 'white'} border-secondary" href="#" onclick="loadReviews(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    paginationHTML += '</ul></nav>';
    container.innerHTML = paginationHTML;
}

// Load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/reviews/stats`);
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('avgRating').textContent = parseFloat(stats.average_rating).toFixed(1);
            document.getElementById('totalReviews').textContent = stats.total_reviews;
            
            // Update star display
            const avgStars = document.getElementById('avgStars');
            const rating = Math.round(stats.average_rating);
            avgStars.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                avgStars.innerHTML += `<i class="bi bi-star${i <= rating ? '-fill' : ''}"></i>`;
            }
        }
    } catch (error) {
        console.error('Load stats error:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadReviews();
    loadStats();
});