CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_number varchar(32) UNIQUE NOT NULL,
  email varchar(254) UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name varchar(160) NOT NULL,
  role varchar(24) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'registrar', 'finance')),
  status varchar(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  token_version integer NOT NULL DEFAULT 1,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  identifier varchar(254) NOT NULL,
  ip_address varchar(64) NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  PRIMARY KEY (identifier, ip_address)
);

CREATE TABLE IF NOT EXISTS important_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(160) NOT NULL,
  event_date date NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description varchar(200) NOT NULL,
  due_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  scholarship_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (scholarship_amount >= 0),
  status varchar(16) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  payment_mode varchar(40),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_due_idx ON payments(user_id, due_date DESC);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code varchar(32) UNIQUE NOT NULL,
  course_name varchar(200) NOT NULL,
  units numeric(4,1) NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  term varchar(24) NOT NULL,
  school_year varchar(16) NOT NULL,
  schedule varchar(120),
  room varchar(80),
  status varchar(16) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, term, school_year)
);

CREATE INDEX IF NOT EXISTS enrollments_user_idx ON enrollments(user_id);
