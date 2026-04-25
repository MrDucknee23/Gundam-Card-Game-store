/**
 * 📚 BACKEND SCRIPTS
 * 
 * Utility scripts để migrate, cleanup, seed data
 */

// ═══════════════════════════════════════════════════════════════════════════
// npm run dev
// ═══════════════════════════════════════════════════════════════════════════
// Chạy server ở development mode với nodemon (auto-reload)

// ═══════════════════════════════════════════════════════════════════════════
// npm run migrate:product-images
// ═══════════════════════════════════════════════════════════════════════════
// Script: scripts/migrateBase64ToFiles.js
// 
// Purpose: Chuyển ảnh từ base64 (encode trong database) → files
// 
// Why:
// - Base64 trong DB → lớn, chậm
// - Files trên disk → nhanh, compact
//
// Process:
// 1. Đọc tất cả products từ DB
// 2. Lấy ảnh base64 từ product.image
// 3. Decode base64 → binary
// 4. Save vào /uploads/products/[productId].png
// 5. Update product.image → file path
// 6. Remove base64 từ DB
//
// Usage: npm run migrate:product-images
// Status: Check logs, restart server after completion

// ═══════════════════════════════════════════════════════════════════════════
// npm run migrate:cloudinary-images
// ═══════════════════════════════════════════════════════════════════════════
// Script: scripts/migrateImagesToCloudinary.js
//
// Purpose: Upload ảnh từ file system → Cloudinary (cloud storage)
//
// Why:
// - Local files → server restarts lose them
// - Cloudinary → reliable, CDN, auto-optimize
//
// Process:
// 1. Đọc tất cả files từ /uploads folder
// 2. Upload each file to Cloudinary
// 3. Get secure_url từ Cloudinary
// 4. Update product.image → Cloudinary URL
// 5. Delete local files
// 6. Update DB với new URLs
//
// Usage: npm run migrate:cloudinary-images
// Note: Require CLOUDINARY_* env variables

// ═══════════════════════════════════════════════════════════════════════════
// npm run cleanup:legacy-base64
// ═══════════════════════════════════════════════════════════════════════════
// Script: scripts/cleanupLegacyBase64InDb.js
//
// Purpose: Remove legacy base64 data từ DB (cleanup)
//
// Why:
// - After migration, base64 vẫn còn chiếm DB space
// - Cleanup → reduce DB size, faster queries
//
// Process:
// 1. Đọc tất cả products
// 2. Check nếu still have base64 images
// 3. Delete base64 (keep only new image URL)
// 4. Save changes
//
// Usage: npm run cleanup:legacy-base64
// Warning: Run AFTER successful migrate to Cloudinary!

// ═══════════════════════════════════════════════════════════════════════════
// scripts/migrateLegacyOrdersUserId.js
// ═══════════════════════════════════════════════════════════════════════════
// Script: migrateLegacyOrdersUserId.js
//
// Purpose: Fix legacy orders schema (update userId references)
//
// Why:
// - Old orders might have different user ID format
// - Need consistent schema for new features
//
// Process:
// 1. Đọc old orders
// 2. Map old userId → new userId
// 3. Update in DB
//
// Usage: node scripts/migrateLegacyOrdersUserId.js

// ═══════════════════════════════════════════════════════════════════════════
// Seed Scripts
// ═══════════════════════════════════════════════════════════════════════════
// seed.js             - Tạo test data (users, products, categories)
// seed-orders.js      - Tạo test orders
// seedUsers.js        - Tạo test users
//
// Usage: node seed.js
// Purpose: Initialize database với sample data (development/testing)

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════
// 1. Backup database (export MongoDB collection)
// 2. npm run migrate:product-images
//    - Monitor console for errors
// 3. Verify files created: ls -la uploads/products/
// 4. Set CLOUDINARY_* environment variables
// 5. npm run migrate:cloudinary-images
//    - Monitor console for upload progress
// 6. Verify URLs updated in DB
// 7. npm run cleanup:legacy-base64
//    - Remove old base64 data
// 8. Test application (images should load from Cloudinary)
// 9. Delete /uploads folder (no longer needed)

// ═══════════════════════════════════════════════════════════════════════════
// ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════
// If something goes wrong:
// 1. Restore database backup
// 2. Check error logs
// 3. Fix issue (e.g., missing env variables, file permissions)
// 4. Run migration again
