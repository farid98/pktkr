# pktkr

A local-first Next.js and Tailwind website for exploring KSE-100 market treemaps. Plotly renders each selected session directly from its dated CSV.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## SEO and sharing

Set `NEXT_PUBLIC_SITE_URL=https://pktkr.com` in deployment settings. It is used for
canonical URLs, the sitemap, robots.txt, and social sharing metadata. The app also
generates a branded 1200×630 Open Graph image at `/opengraph-image`.

## Data layout

```text
public/data/
  index.json
  latest.json
  daily/
    kse100_2026-07-21.csv
    kse100_2026-07-22.csv
    kse100_2026-07-23.csv
```

`index.json` contains all available sessions and identifies the latest date. Older CSVs are retained, so the homepage date selector can reconstruct any saved session.

The sibling `psx2` project updates this folder after a successful trading-day pipeline run:

```bash
cd /Users/farid/dev/finance/psx2
uv run python scripts/publishing/export_to_pktkr.py --date YYYY-MM-DD
```

The website does not scrape PSX and does not require Python. A future Git/Vercel publishing step can commit the new dated CSV and updated JSON manifests after each validated session.

## Checks

```bash
npm run lint
npm run build
```
