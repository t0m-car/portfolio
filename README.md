# portfolio

Source for my personal site, [tomca.be](https://tomca.be).

Built with Next.js (App Router) and TypeScript. Styling with Tailwind CSS v4,
motion with Motion, and a few WebGL pieces with Three.js.

## Stack

- Next.js 15 / React 19
- TypeScript
- Tailwind CSS v4
- Three.js (signature shaders in `/lab`)
- Motion

## Running locally

```bash
npm install
npm run dev
```

The site runs at `http://localhost:3000`.

## Environment

Two integrations read from environment variables. Both are optional: the site
renders fine without them, the related widgets just stay quiet.

Copy the template and fill in what you need:

```bash
cp .env.example .env.local
```

- `SPOTIFY_*` powers the "now playing" status in the hero. Create an app at the
  [Spotify dashboard](https://developer.spotify.com/dashboard) for the client id
  and secret, then obtain a refresh token.
- `GITHUB_TOKEN` raises the rate limit for the "latest commit" widget. A
  read-only fine-grained token on public data is enough. The widget falls back
  to the anonymous API when it is absent.

## Structure

- `app/` routes, layout, metadata, API routes
- `components/` UI, including `lab/` and `ink/` for the WebGL work
- `lib/` content and the server-side integration helpers
- `public/` static assets

## License

Code is under the [MIT License](LICENSE): reuse it freely, just keep the
copyright notice. A credit is appreciated.

Content is not. The text, design and images (including `public/me.jpg`) are
all rights reserved. Please do not pass the site off as your own.
