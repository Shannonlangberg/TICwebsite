-- TIC Platform — seed the 9 TIC video sessions
-- Run after schema.sql, in the Supabase SQL Editor.
--
-- Titles/order confirmed with Shannon 15 Jul 2026: Word of God inserted at
-- #5, pushing Freedom in God / The Church / Prayer / Water Baptism down one.
--
-- Vimeo links updated 15 Jul 2026 — new links are plain public video IDs
-- (no share hash), so vimeo_hash is null for these. The embed URL
-- construction in videos/[slug]/page.tsx already handles both cases.

insert into public.videos (title, slug, vimeo_id, vimeo_hash, order_index, published)
values
  ('Salvation', 'episode-1', '1135552479', null, 1, true),
  ('Salvation #2', 'episode-2', '1135552780', null, 2, true),
  ('Baptism in the Holy Spirit', 'episode-3', '1135552964', null, 3, true),
  ('Sharing Your Faith', 'episode-4', '1135553440', null, 4, true),
  ('Word of God', 'episode-5', '1135553696', null, 5, true),
  ('Freedom in God', 'episode-6', '1135553924', null, 6, true),
  ('The Church', 'episode-7', '1135554235', null, 7, true),
  ('Prayer', 'episode-8', '1135554491', null, 8, true),
  ('Water Baptism', 'episode-9', '1135554732', null, 9, true)
on conflict (slug) do update set
  title = excluded.title,
  vimeo_id = excluded.vimeo_id,
  vimeo_hash = excluded.vimeo_hash,
  order_index = excluded.order_index;
