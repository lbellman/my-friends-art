-- Local seed: 3 artists, 30 art pieces (10 each). Paths left NULL; run `pnpm seed:local-assets` after reset.
-- IDs must match scripts/seed-ids.ts

-- Storage buckets (same names as production; required for `pnpm seed:local-assets` uploads)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('art-pieces', 'art-pieces', true),
  ('originals', 'originals', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.artist (
  id,
  name,
  bio,
  location,
  website,
  instagram,
  email_address,
  status
) VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Elena Vasquez',
    'Painter working in layered watercolor and acrylic. Recent work explores coastal light and domestic still life. Based in Vancouver.',
    'Vancouver, BC',
    'https://elenavasquez.example.com',
    '@elenav.studio',
    'elena.vasquez@example.com',
    'approved'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Marcus Okonkwo',
    'Mixed-media artist combining digital collage with traditional drawing. Themes of urban rhythm and memory. Toronto-based.',
    'Toronto, ON',
    NULL,
    '@marcus.okonkwo.art',
    'marcus.okonkwo@example.com',
    'approved'
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'Yuki Tanaka',
    'Digital and ink works inspired by seasonal change and quiet architecture. Exhibited across Quebec and online.',
    'Montreal, QC',
    'https://yukitanaka.example.com',
    '@yuki.tanaka.studio',
    'yuki.tanaka@example.com',
    'approved'
  );

INSERT INTO public.art_piece (
  id,
  title,
  medium,
  aspect_ratio,
  artist_id,
  status,
  px_width,
  px_height,
  dpi,
  description,
  not_ai_generated,
  authorized_to_sell,
  product_type,
  display_path,
  thumbnail_path,
  original_path
) VALUES
  -- Artist 1 (Elena)
  ('10100000-0000-4000-8000-000000000001', 'Morning Harbour', 'watercolor', '3:4', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 300, 'Soft morning light on the harbour.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000002', 'Cobalt Drift', 'acrylic', '2:3', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 300, 'Abstract layers in cobalt and teal.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000003', 'Winter Orchard', 'watercolor', '1:1', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 2400, 300, 'Bare branches against snow.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000004', 'Amber Fold', 'pastel', '3:4', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 300, 'Warm folds of fabric study.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000005', 'Still Life with Linen', 'oil', '2:3', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 300, 'Classic table arrangement.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000006', 'Coastal Haze', 'watercolor', '3:4', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 300, 'Mist rolling over the shore.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000007', 'North Shore Light', 'acrylic', '1:1', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 2400, 300, 'High-contrast light study.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000008', 'Paper Boats', 'digital', '2:3', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 300, 'Digital illustration.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-000000000009', 'Vessel Study', 'pencil', '3:4', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3200, 300, 'Graphite study of ceramics.', true, true, 'print', NULL, NULL, NULL),
  ('10100000-0000-4000-8000-00000000000a', 'Blue Hour Market', 'watercolor', '2:3', '10000000-0000-4000-8000-000000000001', 'approved', 2400, 3600, 300, 'Evening market scene.', true, true, 'print', NULL, NULL, NULL),
  -- Artist 2 (Marcus)
  ('10200000-0000-4000-8000-000000000001', 'Market Square Rhythm', 'digital', '3:4', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 300, 'Collage of urban movement.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000002', 'Patina Doorways', 'mixed-media', '2:3', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3600, 300, 'Texture and aged metal.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000003', 'Echo Chamber', 'acrylic', '1:1', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 2400, 300, 'Geometric abstraction.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000004', 'Clay Meditation', 'oil', '3:4', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 300, 'Earthy palette study.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000005', 'Urban Canopy', 'digital', '2:3', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3600, 300, 'Trees over the avenue.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000006', 'Ochre Geometry', 'pastel', '1:1', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 2400, 300, 'Bold shapes and ochre.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000007', 'Rain on Tin', 'watercolor', '3:4', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 300, 'Grey rain streaks.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000008', 'Brass and Glass', 'pen', '2:3', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3600, 300, 'Fine line interior.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-000000000009', 'Corridor Song', 'digital', '3:4', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 3200, 300, 'Perspective down a hall.', true, true, 'print', NULL, NULL, NULL),
  ('10200000-0000-4000-8000-00000000000a', 'Found Objects No. 4', 'wood', '1:1', '20000000-0000-4000-8000-000000000002', 'approved', 2400, 2400, 300, 'Assemblage of found wood.', true, true, 'print', NULL, NULL, NULL),
  -- Artist 3 (Yuki)
  ('10300000-0000-4000-8000-000000000001', 'Snow Line', 'digital', '2:3', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3600, 300, 'Minimal winter landscape.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000002', 'Tea House Interior', 'watercolor', '3:4', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 300, 'Quiet interior light.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000003', 'Bamboo Shadow', 'pen', '1:1', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 2400, 300, 'Ink wash on paper.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000004', 'Ink River', 'digital', '3:4', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 300, 'Flowing dark lines.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000005', 'First Cherry Bloom', 'watercolor', '2:3', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3600, 300, 'Pale pink blossoms.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000006', 'Fog on the Ridge', 'acrylic', '3:4', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 300, 'Atmospheric ridge line.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000007', 'Paper Crane', 'digital', '1:1', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 2400, 300, 'Origami-inspired digital.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000008', 'Late Summer Field', 'pastel', '2:3', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3600, 300, 'Warm grasses.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-000000000009', 'Moon Gate', 'watercolor', '3:4', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3200, 300, 'Circular garden frame.', true, true, 'print', NULL, NULL, NULL),
  ('10300000-0000-4000-8000-00000000000a', 'Wet Stone Garden', 'oil', '2:3', '30000000-0000-4000-8000-000000000003', 'approved', 2400, 3600, 300, 'Rain-slick stones.', true, true, 'print', NULL, NULL, NULL);
