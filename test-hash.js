const bcrypt = require("bcryptjs");

// Hash จาก Supabase (ที่คุณเห็นใน console log)
const currentHash =
  "$2b$10$eSYOZAnS8bRtyaL9L./zUuEqYQ3qIZWIhrIlYGejq4LAE91Uy44G6";

// ลองรหัสผ่านต่างๆ
const testPasswords = [
  "admin123",
  "admin1234",
  "Admin123",
  "Admin1234",
  "password",
  "123456",
];

let found = false;
testPasswords.forEach((pwd) => {
  const match = bcrypt.compareSync(pwd, currentHash);
    if (match) found = true;
});

if (!found) {
      // สร้าง hash ใหม่
  const correctPassword = "admin1234";
  const correctHash = bcrypt.hashSync(correctPassword, 10);

       ? "ถูกต้อง!" : "ผิด"
  );

    );
    );
}