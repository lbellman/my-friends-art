-- Run in Supabase SQL Editor (local) *after* you create a user with this email
-- (e.g. `pnpm local:create-auth-user` or sign up in the app).
-- Links the first seeded artist to that account so dashboard / artist RLS applies to their pieces.
--
-- Convention email:
--   bellmanlindsey+test@gmail.com
--
-- Artist id (first seed artist — Elena Vasquez):
--   10000000-0000-4000-8000-000000000001

UPDATE public.artist
SET user_id = (SELECT id FROM auth.users WHERE email = 'bellmanlindsey+test@gmail.com' LIMIT 1)
WHERE id = '10000000-0000-4000-8000-000000000001';
