import axios from 'axios'
import { ChangeEvent, useEffect, useState } from 'react'
import '~/App.css'
import { api } from '~/lib/api'
import * as cheerio from 'cheerio'
import { getAccessToken, getCurrentlyTrack } from '~/lib/spotify'
import { GeniusResponse, Result } from '~/types/Genius'

type SongInfo = {
  lyric: string
  song: Result[]
  description: string
}

type FormState = {
  title: string
  artist: string
}

const formState: FormState = {
  title: '',
  artist: '',
}

const songState: SongInfo = {
  lyric: '',
  song: [],
  description: '',
}

const playingState = {
  name: '',
  artist: '',
  image: '',
  isPlaying: false,
}

function App() {
  const [form, setForm] = useState(formState)
  const [song, setSong] = useState(songState)
  const [playing, setPlaying] = useState(playingState)
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, title: e.target.value })
  }
  const handleArtistChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, artist: e.target.value })
  }

  useEffect(() => {
    async function spotifyRun() {
      const data = await getAccessToken()
      const playingData = await Promise.resolve(
        getCurrentlyTrack(data.access_token)
      )
      playingData.is_playing &&
        setPlaying({
          name: playingData.item.name || '',
          artist: playingData.item.artists[0].name || '',
          image: playingData.item.album.images[2].url || '',
          isPlaying: playingData.is_playing,
        })
      playingData.is_playing &&
        geniusRun(playingData.item.name, playingData.item.artists[0].name)
    }
    spotifyRun()
  }, [])

  function geniusRun(title: string, artist: string): Promise<SongInfo> {
    const modTitle = title.replace(/\s-.*/g, '')
    const songTitle = `${modTitle} ${artist}`
      .toLowerCase()
      .replace(/ *\([^)]*\) */g, '')
      .replace(/ *\[[^\]]*]/, '')
      .replace(/feat.|ft./g, '')
      .replace(/\s+/g, ' ')
      .trim()
    const reqUrl = `${encodeURIComponent(songTitle)}`
    return new Promise(function (resolve, reject) {
      // 1
      api
        .get<GeniusResponse>(
          `/search?q=${reqUrl}&access_token=${import.meta.env.VITE_API_KEY}`
        )
        // 2
        .then((res) => {
          const song = res.data.response.hits.map((hit) => {
            return hit.result
          })
          return song
        })
        // 3
        .then(async (song) => {
          const res = await axios.get(`/genius.com${song[0].path}`)
          return { res, song }
        })
        .then(({ res, song }) => {
          // console.log(res)
          const $ = cheerio.load(res.data)
          // console.log(res.data)
          let lyrics = $('div[class="lyrics"]').text().trim()
          // console.log($('div[class^="Lyrics__Container"]').html())
          if (!lyrics) {
            lyrics = ''
            $('div[class^="Lyrics__Container"]').each((i: number, elem) => {
              if ($(elem).text().length !== 0) {
                // @ts-ignore
                let snippet = $(elem)
                  .html()
                  .replace(/<br>/g, '\n')
                  .replace(/<(?!\s*br\s*\/?)[^>]+>/gi, '')
                // console.log(snippet)
                lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n'
              }
            })
          }
          let description = $('div[class="description"]').text().trim()
          if (!description) {
            description = ''
            $('div[class^="SongDescription__Content-sc-615rvk-2"]').each(
              (i: number, elem) => {
                if ($(elem).text().length !== 0) {
                  description = $(elem).text()
                }
              }
            )
          }
          // console.log(description)
          const lyric = lyrics.trim()
          return { lyric, song, description }
        })
        .then((songInfo) => {
          setSong({
            song: songInfo.song,
            lyric: songInfo.lyric,
            description: songInfo.description,
          })
        })
        .then(() => {
          setForm({ title: '', artist: '' })
        })
        .catch((e) => window.alert('Can not find the song.'))
    })
  }

  const handleClick = async () => {
    await geniusRun(form.title, form.artist)
  }

  return (
    <div className="App">
      <h1>Genius API</h1>
      {playing.isPlaying ? (
        <div className="card">
          <p>{playing.artist}</p>
          <img src={playing.image} alt="" />
          <p>{playing.name}</p>
          {song.lyric !== '' && (
            <>
              <p className="title">Lyrics</p>
              <p className="content">{song.lyric}</p>
            </>
          )}
          {song.description !== '' && <p className="title">Description</p>}
          {song !== undefined && <p className="content">{song.description}</p>}
        </div>
      ) : (
        <div className="card">
          <input
            type="text"
            placeholder="artist"
            name="title"
            value={form.artist}
            onChange={handleArtistChange}
          />
          <input
            type="text"
            placeholder="title"
            name="artist"
            value={form.title}
            onChange={handleTitleChange}
          />
          <button onClick={() => handleClick()}>search</button>
          {song !== null && (
            <p>Please type a song title which you want to search.</p>
          )}
          {song.song[0] !== undefined && (
            <p className="song">
              {song.song[0]?.title} / {song.song[0]?.artist_names}
            </p>
          )}
          {song.lyric !== '' && (
            <>
              <p className="title">Lyrics</p>
              <p className="content">{song.lyric}</p>
            </>
          )}
          {song.description !== '' && <p className="title">Description</p>}
          {song !== undefined && <p className="content">{song.description}</p>}
        </div>
      )}

      <p className="read-the-docs">Genius API is genius.</p>
    </div>
  )
}

export default App
