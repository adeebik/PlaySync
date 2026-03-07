import stringSimilarity from 'string-similarity'

export interface YouTubeSearchResult {
  id: string
  title: string
  channelTitle: string
}

export async function createYouTubePlaylist(accessToken: string, title: string, description: string = ''): Promise<string> {
  const response = await fetch('https://youtube.googleapis.com/youtube/v3/playlists?part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        title: title,
        description: description,
      },
      status: {
        privacyStatus: 'private'
      }
    }),
  })

  if (!response.ok) {
    throw new Error(`YouTube Create Playlist Error: ${response.status}`)
  }

  const data = await response.json()
  return data.id
}

export async function addVideoToYouTubePlaylist(accessToken: string, playlistId: string, videoId: string): Promise<void> {
  const response = await fetch('https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: videoId,
        }
      }
    }),
  })

  // Sometimes YouTube rejects additions (e.g. region blocking, quota). We just throw and let the transfer logger catch it
  if (!response.ok) {
    throw new Error(`YouTube Add Video Error: ${response.status}`)
  }
}

/**
 * Searches YouTube for the best matching mathematical track based on the Levenshtein distance 
 * of the title and artist constraints. Highly robust against covers/live versions.
 */
export async function searchYouTubeVideo(accessToken: string, trackName: string, artistName: string, isrc?: string): Promise<string | null> {
  // 1. Initial Query heuristic
  const query = `${trackName} ${artistName} official audio`
  
  const response = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`YouTube Search Error: ${response.status}`)
  }

  const data = await response.json()
  if (!data.items || data.items.length === 0) return null

  // 2. Score the returned candidates
  let bestMatch: string | null = null
  let highestScore = 0

  for (const item of data.items) {
    const title = item.snippet.title.toLowerCase()
    const channelTitle = item.snippet.channelTitle.toLowerCase()
    let score = stringSimilarity.compareTwoStrings(title, trackName.toLowerCase()) * 100

    // Boosts for official content
    if (channelTitle.includes(artistName.toLowerCase()) || title.includes(artistName.toLowerCase())) {
      score += 30
    }
    
    // Penalties for Live/Cover versions if the original track wasn't explicitly live
    const isOriginalLive = trackName.toLowerCase().includes('live')
    if (!isOriginalLive && (title.includes('live') || title.includes('cover') || title.includes('karaoke'))) {
      score -= 40
    }

    if (title.includes('official audio') || title.includes('official music video')) {
       score += 20
    }

    if (score > highestScore && score >= 45) { // 45 is the threshold of confidence
      highestScore = score
      bestMatch = item.id.videoId
    }
  }

  // Fallback to top result if we are desperate but it matched the generic query
  if (!bestMatch && data.items.length > 0) {
     return data.items[0].id.videoId
  }

  return bestMatch
}
