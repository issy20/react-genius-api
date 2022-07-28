import axios from 'axios'
import { SpotifyAuthApiResponse } from '~/types/Auth'
import { CurrentPlayingTrackType } from '~/types/PlayingTrack'
import { RecentlyPlayedTrackType } from '~/types/PlayedTrack'

export async function getAccessToken(): Promise<SpotifyAuthApiResponse> {
  const params = new URLSearchParams()
  params.append('grant_type', 'refresh_token')
  params.append('refresh_token', import.meta.env.VITE_REFRESH_TOKEN || '')
  const res = await axios.post<SpotifyAuthApiResponse>(
    'https://accounts.spotify.com/api/token',
    params,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${import.meta.env.VITE_CLIENT_ID}:${
            import.meta.env.VITE_CLIENT_SECRET
          }`
        ).toString('base64')}`,
      },
    }
  )
  return res.data
}

export async function getCurrentlyTrack(
  accessToken: string
): Promise<Pick<CurrentPlayingTrackType, 'item' | 'is_playing'>> {
  const res = await axios.get<CurrentPlayingTrackType>(
    'https://api.spotify.com/v1/me/player/currently-playing',
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'en',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  return res.data
}

export async function getRecentlyTrack(
  accessToken: string
): Promise<RecentlyPlayedTrackType> {
  const res = await axios.get<RecentlyPlayedTrackType>(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1',
    {
      headers: {
        'Content-Type': 'application/json',
        //prettier-ignore
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return res.data
}
