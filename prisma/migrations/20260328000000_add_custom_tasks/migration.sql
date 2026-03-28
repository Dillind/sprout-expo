CREATE TABLE custom_tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  plant_id TEXT REFERENCES plants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type "CareType" NOT NULL,
  due_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX custom_tasks_user_id_idx ON custom_tasks(user_id);
CREATE INDEX custom_tasks_due_date_idx ON custom_tasks(due_date);
