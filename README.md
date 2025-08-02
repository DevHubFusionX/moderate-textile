# Moderate Ustaz Backend

Backend API for Moderate Ustaz clothing e-commerce website.

## Features
- JWT Authentication
- Product CRUD operations
- Cloudinary image storage
- MongoDB database
- Admin panel API

## Setup
1. Install dependencies: `npm install`
2. Create `.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Start server: `npm start`

## API Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/products` - Get all products
- `POST /api/admin/products` - Add product (protected)
- `PUT /api/admin/products/:id` - Update product (protected)
- `DELETE /api/admin/products/:id` - Delete product (protected)

## Admin Credentials
- Email: admin@moderateustaz.com
- Password: admin123