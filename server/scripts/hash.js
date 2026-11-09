// Usage: npm run hash -- "my-strong-password"
import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) { console.error('Usage: npm run hash -- "your-password"'); process.exit(1); }
console.log(`\nADMIN_PASSWORD_HASH="${bcrypt.hashSync(pw, 12)}"\n`);
