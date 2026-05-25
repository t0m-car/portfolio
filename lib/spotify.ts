import "server-only";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export type NowPlaying = {
  isPlaying: boolean;
  title: string;
  artist: string;
  url: string | null;
  albumImage: string | null;
  progressMs: number | null;
  durationMs: number | null;
};

type SpotifyArtist = { name: string };
type SpotifyImage = { url: string };
type SpotifyTrack = {
  name: string;
  artists: SpotifyArtist[];
  duration_ms: number;
  external_urls?: { spotify?: string };
  album?: { images?: SpotifyImage[] };
};

function credentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken(c: NonNullable<ReturnType<typeof credentials>>): Promise<string> {
  const basic = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: c.refreshToken,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`token refresh ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

function pickImage(track: SpotifyTrack): string | null {
  const images = track.album?.images ?? [];
  return images.length ? images[images.length - 1].url : null;
}

function toNowPlaying(track: SpotifyTrack, isPlaying: boolean, progressMs: number | null): NowPlaying {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    url: track.external_urls?.spotify ?? null,
    albumImage: pickImage(track),
    progressMs,
    durationMs: track.duration_ms ?? null,
  };
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  const c = credentials();
  if (!c) return null;

  try {
    const token = await getAccessToken(c);
    const auth = { Authorization: `Bearer ${token}` };

    const current = await fetch(NOW_PLAYING_ENDPOINT, { headers: auth, cache: "no-store" });
    if (current.status === 200) {
      const body = (await current.json()) as {
        is_playing: boolean;
        progress_ms: number | null;
        item: SpotifyTrack | null;
      };
      if (body.item) return toNowPlaying(body.item, body.is_playing, body.progress_ms);
    }

    const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: auth, cache: "no-store" });
    if (recent.status === 200) {
      const body = (await recent.json()) as { items: { track: SpotifyTrack }[] };
      const track = body.items?.[0]?.track;
      if (track) return toNowPlaying(track, false, null);
    }

    return null;
  } catch (err) {
    console.warn("[spotify] getNowPlaying failed", err);
    return null;
  }
}
