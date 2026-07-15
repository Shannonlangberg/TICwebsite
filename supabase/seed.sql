-- TIC Platform — seed the 9 TIC video sessions
-- Run after schema.sql, in the Supabase SQL Editor.
-- Note: these are Vimeo "unlisted" links (id + share hash), which is actually
-- more reliable for embedding than fully "Public" videos — the hash grants
-- playback access regardless of domain-embed restrictions.

insert into public.videos (title, slug, vimeo_id, vimeo_hash, order_index, published)
values
  ('Episode 1', 'episode-1', '936060124', '3716530630', 1, true),
  ('Episode 2', 'episode-2', '936060266', '2e71a8fcff', 2, true),
  ('Episode 3', 'episode-3', '936060367', '53be79b427', 3, true),
  ('Episode 4', 'episode-4', '936060535', '5e8928d531', 4, true),
  ('Episode 5', 'episode-5', '936060669', '0ef229015d', 5, true),
  ('Episode 6', 'episode-6', '936060756', 'cb56cb3498', 6, true),
  ('Episode 7', 'episode-7', '936060888', '762dd81b5d', 7, true),
  ('Episode 8', 'episode-8', '936061060', '3817f3b520', 8, true),
  ('Episode 9', 'episode-9', '936061229', 'f030e5e745', 9, true)
on conflict (slug) do update set
  vimeo_id = excluded.vimeo_id,
  vimeo_hash = excluded.vimeo_hash,
  order_index = excluded.order_index;
