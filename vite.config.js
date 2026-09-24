import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * 검색엔진 설정(robots.txt·sitemap.xml).
 *
 * 이 프로젝트는 EXPRISM 제품 사이트(exprism.co.kr) 전용이다.
 * 회사 사이트(kanchenjunga.co.kr)는 saas-company-web 으로 분리됐다.
 *
 *   npm run build:exprism   제품 사이트 → 3.38.178.93 (/opt/saas-client-web/dist)
 *
 * 모드를 주지 않고 그냥 `npm run build` 하면 robots/sitemap 을 만들지 않는다.
 */
const SITES = {
  exprism: {
    origin: 'https://www.exprism.co.kr',
    // 제품(EXPRISM) 도메인은 EXPRISM 아이콘을 파비콘으로 쓴다.
    favicon: 'https://d2ziky4ycezd5d.cloudfront.net/saas-admin/brand/exprism-icon-128-v2.png',
    // 색인 대상은 제품 소개(root)뿐. 손님 주문 경로(/{업체코드}/{테이블코드})는 검색에 나올 것이 아니다.
    paths: [
      ['/', 1.0, 'weekly'],
    ],
    // 회사 화면(/company 등)은 kanchenjunga.co.kr 이 원본이라 이 도메인에서 색인하지 않는다.
    disallow: ['/company', '/api/'],
  },
}

/** dist 에 robots.txt 와 sitemap.xml 을 써 넣는 플러그인. */
function seoFiles(mode) {
  const site = SITES[mode]
  return {
    name: 'seo-files',
    apply: 'build',
    closeBundle() {
      if (!site) {
        this.warn(
          `robots.txt/sitemap.xml 을 만들지 않았다 (mode=${mode}). 배포할 때는 build:exprism 을 쓸 것.`,
        )
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      const out = (name, body) => writeFileSync(resolve(__dirname, 'dist', name), body, 'utf-8')

      out('robots.txt', [
        'User-agent: *',
        'Allow: /',
        ...site.disallow.map((p) => `Disallow: ${p}`),
        '',
        `Sitemap: ${site.origin}/sitemap.xml`,
        '',
      ].join('\n'))

      out('sitemap.xml', [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...site.paths.map(([path, priority, changefreq]) =>
          [
            '  <url>',
            `    <loc>${site.origin}${path}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${changefreq}</changefreq>`,
            `    <priority>${priority.toFixed(1)}</priority>`,
            '  </url>',
          ].join('\n')),
        '</urlset>',
        '',
      ].join('\n'))
    },
  }
}

/**
 * 정적 index.html 의 head 를 빌드 모드별 회사 정보로 갈아 끼운다.
 * SPA 는 본문을 JS 로 그려서 크롤러가 못 읽으므로, 최소한 제목·설명·키워드·OG 는 정적으로 박아
 * 네이버·구글이 '칸첸중가' 를 색인할 수 있게 한다. head 가 없는 모드(exprism·plain)는 그대로 둔다.
 */
function seoHead(mode) {
  const site = SITES[mode]
  const head = site?.head
  return {
    name: 'seo-head',
    transformIndexHtml(html) {
      if (!head) return html
      const esc = (s) => String(s).replace(/"/g, '&quot;')
      let out = html
      out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${head.title}</title>`)
      out = out.replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${esc(head.description)}" />`,
      )
      const tags = [
        head.keywords && `<meta name="keywords" content="${esc(head.keywords)}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="KANCHENJUNGA" />`,
        `<meta property="og:title" content="${esc(head.title)}" />`,
        `<meta property="og:description" content="${esc(head.description)}" />`,
        `<meta property="og:url" content="${site.origin}/" />`,
        head.image && `<meta property="og:image" content="${site.origin}${head.image}" />`,
      ].filter(Boolean).join('\n    ')
      return out.replace('</head>', `    ${tags}\n  </head>`)
    },
  }
}

/**
 * 빌드 모드별로 파비콘(<link rel="icon"> / apple-touch-icon)을 갈아 끼운다.
 * 이 저장소 하나로 회사 사이트와 제품(EXPRISM) 도메인을 만들므로 파비콘도 달라야 한다.
 * favicon 을 지정하지 않은 모드(kanchenjunga·plain)는 index.html 의 기본값을 그대로 둔다.
 */
function faviconHead(mode) {
  const favicon = SITES[mode]?.favicon
  return {
    name: 'favicon-head',
    transformIndexHtml(html) {
      if (!favicon) return html
      return html
        .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/png" href="${favicon}" />`)
        .replace(/<link rel="apple-touch-icon"[^>]*>/, `<link rel="apple-touch-icon" href="${favicon}" />`)
    },
  }
}

// 손님(무인증) 테이블 주문 앱. 업체 콘솔(5173)과 포트만 다르고,
// /api 는 동일하게 백엔드(8089)로 프록시한다 — 코드에 호스트가 등장하지 않는다.
export default defineConfig(({ mode }) => ({
  plugins: [react(), seoFiles(mode), seoHead(mode), faviconHead(mode)],
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
      },
    },
  },
}))
