import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_DOMAIN,
})

export const _api = axios.create({
  baseURL: import.meta.env.VITE_DOMAIN,
  // baseURL: '/domain',
  // baseURL: import.meta.env.VITE_API_DOMAIN,
  headers: {
    'Content-Type': 'text/html; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
  },
})
