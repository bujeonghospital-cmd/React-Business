const bcrypt = require("bcryptjs");

// สร้าง hash ใหม่สำหรับ password: admin123
const password = "admin123";
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

// Test compare
const isMatch = bcrypt.compareSync(password, hash);
