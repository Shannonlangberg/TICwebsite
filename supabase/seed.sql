-- TIC Platform — seed the 9 TIC video sessions
-- Run after schema.sql, in the Supabase SQL Editor.
-- Note: these are Vimeo "unlisted" links (id + share hash), which is actually
-- more reliable for embedding than fully "Public" videos — the hash grants
-- playback access regardless of domain-embed restrictions.
--
-- Titles/order confirmed with Shannon 15 Jul 2026: Word of God inserted at
-- #5, pushing Freedom in God / The Church / Prayer / Water Baptism down one.

insert into public.videos (title, slug, vimeo_id, vimeo_hash, order_index, published)
values
  ('Salvation', 'episode-1', '936060124', '3716530630', 1, true),
  ('Salvation #2', 'episode-2', '936060266', '2e71a8fcff', 2, true),
  ('Baptism in the Holy Spirit', 'episode-3', '936060367', '53be79b427', 3, true),
  ('Sharing Your Faith', 'episode-4', '936060535', '5e8928d531', 4, true),
  ('Word of God', 'episode-5', '936060669', '0ef229015d', 5, true),
  ('Freedom in God', 'episode-6', '936060756', 'cb56cb3498', 6, true),
  ('The Church', 'episode-7', '936060888', '762dd81b5d', 7, true),
  ('Prayer', 'episode-8', '936061060', '3817f3b520', 8, true),
  ('Water Baptism', 'episode-9', '936061229', 'f030e5e745', 9, true)
on conflict (slug) do update set
  title = excluded.title,
  vimeo_id = excluded.vimeo_id,
  vimeo_hash = excluded.vimeo_hash,
  order_index = excluded.order_index;
