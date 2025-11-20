const bcrypt = require("bcryptjs");

// Hash ที่เก็บใน Supabase (ที่คุณเห็นใน console)
const hashFromDB =
  "$2b$10$eSYOZAnS8bRtyaL9L./zUuEqYQ3qIZWIhrIlYGejq4LAE91Uy44G6";

);
);

// ทดสอบรหัสผ่านหลายแบบ
const passwords = ["admin1234", "admin123", "Admin1234", "ADMIN1234"];

passwords.forEach((password) => {
  const isMatch = bcrypt.compareSync(password, existingHash);
});

// สร้าง hash ใหม่
const newPassword = "admin1234";
const newHash = bcrypt.hashSync(newPassword, 10);

 ? "✓ ถูกต้อง!" : "✗ ผิดพลาด"
  }`
);

);
);
);