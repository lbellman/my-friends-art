// Fake data matching what your app expects
const fakeArtists = [
  {
    id: 'artist-1',
    name: 'Test Artist',
    bio: 'Bio',
    profile_img_url: null,
    location: null,
    email_address: null,
    facebook: null,
    website: null,
    instagram: null,
  },
];

const fakeArtPieces = [
  {
    id: 'piece-1',
    title: 'Test Piece',
    thumbnail_path: null,
    display_path: null,
    medium: 'digital',
    artist_id: 'artist-1',
    artist: { id: 'artist-1', name: 'Test Artist' },
  },
];

const mockFrom = (table) => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    single: () =>
      Promise.resolve(
        table === 'artist'
          ? { data: fakeArtists[0], error: null }
          : { data: fakeArtPieces[0], error: null }
      ),
  };
  // Make chain thenable so .from().select() can be awaited
  chain.then = (resolve) =>
    Promise.resolve(
      table === 'artist' ? { data: fakeArtists, error: null } : { data: fakeArtPieces, error: null }
    ).then(resolve);
  return chain;
};

jest.mock('@/lib/supabase/server', () => ({
  __esModule: true,
  default: {
    from: mockFrom,
    rpc: (name) =>
      Promise.resolve(
        name === 'get_dimension_options'
          ? { data: [{ width: 8, height: 10 }], error: null }
          : name === 'rpc_search_art_pieces'
            ? { data: [], error: null }
            : name === 'rpc_search_artists'
              ? { data: fakeArtists, error: null }
              : { data: null, error: null }
      ),
    storage: {
      from: () => ({
        getPublicUrl: (path) => ({ data: { publicUrl: path ? `https://mock.storage/${path}` : undefined } }),
      }),
    },
  },
}));

require('@testing-library/jest-dom');
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;