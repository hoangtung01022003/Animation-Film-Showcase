# 🔧 FIX LỖI BUILD FAILED TRÊN RENDER

## ❌ Nguyên nhân lỗi:
Render đang chạy `npm start` trong **Build Command** thay vì **Start Command**, khiến server bị kill sau khi khởi động.

## ✅ Giải pháp:

### Bước 1: Vào Render Dashboard
1. Truy cập: https://dashboard.render.com
2. Chọn Web Service của bạn: **Animation-Film-Showcase**
3. Click tab **Settings**

### Bước 2: Sửa Build & Start Commands
Scroll xuống phần **Build & Deploy**, sửa lại như sau:

#### **Build Command:**
```bash
npm install
```
Hoặc để trống (Render sẽ tự động chạy `npm install`)

#### **Start Command:**
```bash
npm start
```

### Bước 3: Environment Variables
Kiểm tra các biến môi trường đã được cấu hình chưa:

```
DATABASE_URL=<Internal_Database_URL_từ_PostgreSQL>
JWT_SECRET=<random_secret_key>
NODE_ENV=production
CLIENT_URL=https://animation-film-showcase.onrender.com
PORT=10000
```

**Lấy DATABASE_URL:**
- Vào PostgreSQL service > Info tab
- Copy **Internal Database URL**
- Paste vào Environment Variables của Web Service

### Bước 4: Manual Deploy
1. Scroll lên đầu trang Settings
2. Click **Manual Deploy** > **Deploy latest commit**
3. Hoặc push code mới lên GitHub để trigger auto-deploy

---

## 📋 Checklist trước khi deploy:

- ✅ Build Command: `npm install` (hoặc để trống)
- ✅ Start Command: `npm start`
- ✅ Environment Variables đã cấu hình đầy đủ
- ✅ DATABASE_URL đã copy từ PostgreSQL Internal URL
- ✅ JWT_SECRET đã tạo random key mạnh
- ✅ NODE_ENV=production
- ✅ Code đã push lên GitHub

---

## 🎯 Expected Output sau khi deploy thành công:

```
🚀 Server đang chạy tại PORT: 10000
📝 Environment: production
🗄️  Database: Connected
✅ Đã kết nối thành công tới PostgreSQL database
✅ Database query test successful: 2026-01-08T17:35:39.431Z
==> Your service is live 🎉
```

---

## 🔍 Debug nếu vẫn lỗi:

### Xem Logs:
1. Vào Render Dashboard > Your Service
2. Click tab **Logs**
3. Xem chi tiết lỗi

### Common Issues:

**1. Database connection failed:**
- Kiểm tra DATABASE_URL có đúng không
- Đảm bảo PostgreSQL service đang running
- Sử dụng **Internal Database URL**, không phải External

**2. 404 Not Found cho API:**
- Đã được fix trong commit mới
- Đảm bảo đã push code mới lên GitHub

**3. CORS errors:**
- Kiểm tra CLIENT_URL trong Environment Variables
- Phải match với domain của Render

---

## 🚀 Sau khi deploy thành công:

### Test các API endpoints:

1. **Health Check:**
   ```
   https://animation-film-showcase.onrender.com/health
   ```
   Expected: `{"status":"ok","message":"Server is running"}`

2. **Get Reviews:**
   ```
   https://animation-film-showcase.onrender.com/api/reviews
   ```

3. **Get Stats:**
   ```
   https://animation-film-showcase.onrender.com/api/reviews/stats
   ```

4. **Register (POST):**
   ```
   https://animation-film-showcase.onrender.com/api/auth/register
   ```

### Test trên website:
1. Mở: https://animation-film-showcase.onrender.com
2. Thử đăng ký account mới
3. Thử đăng nhập
4. Thử viết review và vote sao

---

## 📞 Nếu vẫn gặp vấn đề:

1. Check logs trên Render
2. Verify tất cả Environment Variables
3. Đảm bảo database đã chạy schema.sql
4. Test API endpoints bằng Postman hoặc curl
