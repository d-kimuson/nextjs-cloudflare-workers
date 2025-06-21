const buildSuffix = (url?: {
  query?: Record<string, string | number | boolean | Array<string | number | boolean>>,
  hash?: string
}) => {
  const query = url?.query;
  const hash = url?.hash;
  if (!query && !hash) return '';
  const search = (() => {
    if (!query) return '';

    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) =>
          params.append(key, String(item))
        );
      } else {
        params.set(key, String(value));
      }
    });

    return `?${params.toString()}`;
  })();
  return `${search}${hash ? `#${hash}` : ''}`;
};

export const pagesPath = {
  'doujinshi': {
    'daily_ranking': {
      $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/daily-ranking' as const, hash: url?.hash, path: `/doujinshi/daily-ranking${buildSuffix(url)}` })
    },
    'genres': {
      _genreId: (genreId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/genres/[genreId]' as const, query: { genreId }, hash: url?.hash, path: `/doujinshi/genres/${genreId}${buildSuffix(url)}` })
      }),
      $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/genres' as const, hash: url?.hash, path: `/doujinshi/genres${buildSuffix(url)}` })
    },
    'makers': {
      _makerId: (makerId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/makers/[makerId]' as const, query: { makerId }, hash: url?.hash, path: `/doujinshi/makers/${makerId}${buildSuffix(url)}` })
      }),
      $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/makers' as const, hash: url?.hash, path: `/doujinshi/makers${buildSuffix(url)}` })
    },
    'new_releases': {
      $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/new-releases' as const, hash: url?.hash, path: `/doujinshi/new-releases${buildSuffix(url)}` })
    },
    'search': {
      $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/search' as const, hash: url?.hash, path: `/doujinshi/search${buildSuffix(url)}` })
    },
    'series': {
      _seriesId: (seriesId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/series/[seriesId]' as const, query: { seriesId }, hash: url?.hash, path: `/doujinshi/series/${seriesId}${buildSuffix(url)}` })
      })
    },
    'works': {
      _workId: (workId: string | number) => ({
        $url: (url?: { hash?: string }) => ({ pathname: '/doujinshi/works/[workId]' as const, query: { workId }, hash: url?.hash, path: `/doujinshi/works/${workId}${buildSuffix(url)}` })
      })
    }
  },
  'mypage': {
    $url: (url?: { hash?: string }) => ({ pathname: '/mypage' as const, hash: url?.hash, path: `/mypage${buildSuffix(url)}` })
  },
  $url: (url?: { hash?: string }) => ({ pathname: '/' as const, hash: url?.hash, path: `/${buildSuffix(url)}` })
};

export type PagesPath = typeof pagesPath;

export const staticPath = {
  file_svg: '/file.svg',
  globe_svg: '/globe.svg',
  manifest_json: '/manifest.json',
  next_svg: '/next.svg',
  robots_txt: '/robots.txt',
  vercel_svg: '/vercel.svg',
  window_svg: '/window.svg'
} as const;

export type StaticPath = typeof staticPath;
