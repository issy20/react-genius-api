import axios from 'axios'
import { ChangeEvent, useState } from 'react'
import './App.css'
import { api } from './lib/api'

import { GeniusResponse, Result } from './lib/type'
import * as cheerio from 'cheerio'

type SongInfo = {
  lyric: string
  song: Result[]
  description: string
}

type FormState = {
  title: string
  artist: string
}

const formState = {
  title: '',
  artist: '',
}

const songState: SongInfo = {
  lyric: '',
  song: [],
  description: '',
}

function App() {
  const [form, setForm] = useState(formState)
  const [song, setSong] = useState(songState)
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, title: e.target.value })
  }

  const handleArtistChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, artist: e.target.value })
  }

  function run(title: string, artist: string): Promise<SongInfo> {
    const songTitle = `${title} ${artist}`
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

          console.log(description)
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
        .then(() => setForm({ title: '', artist: '' }))
        .catch((e) => window.alert('Can not find the song.'))
    })
  }

  const handleClick = async () => {
    await run(form.title, form.artist)
      .then(() => {
        console.log('success')
      })
      .catch((e) => console.log(e))
  }

  // run('Blinding Lights', 'The Weeknd')

  return (
    <div className="App">
      <h1>Genius API</h1>
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
        {/* {song.lyric !== undefined && <p className="title">Lyrics</p>} */}
        {song.lyric !== '' && (
          <>
            <p className="title">Lyrics</p>
            <p className="content">{song.lyric}</p>
          </>
        )}
        {song.description !== '' && <p className="title">Description</p>}
        {song !== undefined && <p className="content">{song.description}</p>}
      </div>
      <p className="read-the-docs">Genius API is genius.</p>
    </div>
  )
}

export default App
