document.addEventListener("DOMContentLoaded", function () {
    
    // 1. Hiệu ứng Navbar đổi màu khi cuộn
    const navbar = document.getElementById('mainNav');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Xử lý nút Vote (Demo)
    // Bạn có thể thêm code gửi dữ liệu về server sau này
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            alert("Cảm ơn bạn đã bình chọn!");
        });
    });

    // 3. Hiệu ứng Fade-in khi cuộn tới phần tử (Optional - Animation nhẹ nhàng)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                // Tắt observe sau khi đã hiện
                observer.unobserve(entry.target); 
            }
        });
    });

    // Chọn các phần tử cần animate
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Thêm class opacity-0 ban đầu trong CSS nếu muốn dùng hiệu ứng này triệt để
        // Ở đây code demo đơn giản
    });
});