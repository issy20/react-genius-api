export type Options = {
  artist: string
  title: string
  apiKey: string
}

export interface GeniusResponse {
  meta: Meta
  response: Response
}

export interface Meta {
  status: number
}

export interface Response {
  hits: Hit[]
}

export interface Hit {
  highlights: any[]
  index: string
  type: string
  result: Result
}

export interface Result {
  annotation_count: number
  api_path: string
  artist_names: string
  full_title: string
  header_image_thumbnail_url: string
  header_image_url: string
  id: number
  lyrics_owner_id: number
  lyrics_state: string
  path: string
  pyongs_count: number | null
  relationships_index_url: string
  release_date_components: ReleaseDateComponents | null
  release_date_for_display: null | string
  song_art_image_thumbnail_url: string
  song_art_image_url: string
  stats: Stats
  title: string
  title_with_featured: string
  url: string
  featured_artists: any[]
  primary_artist: PrimaryArtist
}

export interface PrimaryArtist {
  api_path: string
  header_image_url: string
  id: number
  image_url: string
  is_meme_verified: boolean
  is_verified: boolean
  name: string
  url: string
  iq?: number
}

export interface ReleaseDateComponents {
  year: number
  month: number
  day: number
}

export interface Stats {
  unreviewed_annotations: number
  concurrents?: number
  hot: boolean
  pageviews?: number
}
