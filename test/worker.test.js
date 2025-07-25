import { describe, it, expect, beforeAll } from 'vitest'
import { Miniflare } from 'miniflare'
import { execSync } from 'node:child_process'

let mf

beforeAll(async () => {
  execSync('npx wrangler build')
  mf = new Miniflare({
    scriptPath: 'dist/index.js',
    modules: true,
    modulesRules: [{ type: 'Text', include: ['**/*.html'] }]
  })
})

describe('worker', () => {
  it('renders markdown', async () => {
    const res = await mf.dispatchFetch('http://localhost/marp', { method: 'POST', body: '# title' })
    const html = await res.text()
    expect(html).toContain('<h1')
  })

  it('serves homepage', async () => {
    const res = await mf.dispatchFetch('http://localhost/')
    expect(res.headers.get('content-type')).toContain('text/html')
  })
})
