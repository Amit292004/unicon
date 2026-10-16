-- CampusConnect — Seed Data for Supabase
-- Run this in Supabase SQL Editor to populate initial colleges and departments

-- 1. Insert Colleges
INSERT INTO "colleges" ("id", "name", "slug", "city", "state", "website", "is_approved")
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Nagaland University', 'nagaland-university', 'Kohima', 'Nagaland', 'https://nagalanduniversity.ac.in', true)
ON CONFLICT ("slug") DO NOTHING;

-- 2. Insert Departments for Nagaland University
INSERT INTO "departments" ("id", "college_id", "name", "code", "duration_years")
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE', 4),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Electronics & Communication', 'ECE', 4),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Civil Engineering', 'CE', 4),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Information Technology', 'IT', 4),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Management Studies', 'MBA', 2),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Agricultural Sciences', 'AGRI', 4)
ON CONFLICT ("college_id", "code") DO NOTHING;
