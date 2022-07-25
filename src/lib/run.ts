import axios from 'axios'
import * as cheerio from 'cheerio'
import { api, _api } from './api'
import { GeniusResponse, Result } from './type'

// export function extractLyrics(url: string) {
//   // const res = await fetch(url)
//   // const text = await res.text()
//   // const doms = new JSDOM(text)
//   return new Promise(function (resolve, reject) {
//     fetch(url)
//       .then((res) => res.text())
//       .then((text) => new JSDOM(text))
//       .then((doms) => {
//         const metas =
//           doms.window.document.getElementsByClassName('Lyrics__Container')
//         console.log(metas)
//       })
//       .catch((e) => console.log(e))
//   })
// }

type SongInfo = {
  lyric: string
  song: Result[]
}

export function run(title: string, artist: string): Promise<SongInfo> {
  // const title = 'Glimpse of Us'
  // const artist = 'Joji'
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
              lyrics += $('<textarea/>').html(snippet).text().trim() + '\n\n'
            }
          })
        }
        // if (!lyrics) return null
        // console.log(lyrics)
        const lyric = lyrics.trim()
        return { lyric, song }
      })
      .then((songInfo) => {
        // console.log(songInfo)
        return songInfo
      })
  })
}

// 歌詞抽出(スクレイピング)　extractLyrics (arg: url)

// 1, title正規化 getTitle (arg: {title, artist})

// 2, 曲検索 searchSong (arg: {title, artist, apiKey})

// 3, 曲取得 getSong, (arg: {title, artist, apiKey})

// 4, 歌詞取得　getLyrics (arg: スクレイピング後の曲情報)

// 5, run
