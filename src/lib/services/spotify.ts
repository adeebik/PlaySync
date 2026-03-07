export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string }
  external_ids?: { isrc?: string }
  duration_ms: number
}

/**
 * Fetches all tracks sequentially from a given Spotify Playlist.
 * Handles pagination automatically.
 */
export async function getSpotifyPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]> {
  let tracks: SpotifyTrack[] = []
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,artists,album,external_ids,duration_ms)),next`

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Filter out null tracks (can happen with deleted songs)
    const validTracks = data.items
      .map((item: any) => item.track)
      .filter((track: any) => track !== null && track.id)

    tracks = [...tracks, ...validTracks]

    url = data.next // Will be null when pagination ends
  }

  return tracks
}
