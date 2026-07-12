import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const [studentNumber, email, fullName, password] = process.argv.slice(2);
if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL before running this script');
if (!studentNumber || !email || !fullName || !password) {
  console.error('Usage: npm run create-user -- <student-number> <email> "<full-name>" "<password>"');
  process.exit(1);
}
if (password.length < 12) throw new Error('Password must contain at least 12 characters');

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 12);
await sql`
  INSERT INTO users (student_number, email, full_name, password_hash)
  VALUES (${studentNumber}, ${email.toLowerCase()}, ${fullName}, ${passwordHash})
  ON CONFLICT (student_number) DO UPDATE SET
    email = excluded.email,
    full_name = excluded.full_name,
    password_hash = excluded.password_hash,
    status = 'active',
    token_version = users.token_version + 1,
    updated_at = now()
`;
console.log(`User ${studentNumber} created or updated successfully.`);
