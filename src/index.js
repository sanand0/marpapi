import { Marp } from '@marp-team/marp-core'
import home from './home.html'

const marp = new Marp()

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (pathname === '/marp' && request.method === 'POST') {
      const text = await request.text()
      if (!text.trim()) return new Response('empty body', { status: 400 })
      const { html, css } = marp.render(text)
      const out = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`
      return new Response(out, { headers: { 'content-type': 'text/html' } })
    }

    if (pathname === '/') return new Response(home, { headers: { 'content-type': 'text/html' } })
    return new Response('Not Found', { status: 404 })
  }
}
