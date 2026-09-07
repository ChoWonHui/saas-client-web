import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * exprism.co.kr 로 들어오면 탭 아이콘과 공유 미리보기를 EXPRISM 것으로 바꾼다.
 *
 * 한 벌의 index.html 이 두 도메인(회사 사이트 · 제품 사이트)과 주문앱을 모두 태우므로,
 * 파일을 나누는 대신 들어온 주소를 보고 head 를 갈아 끼운다.
 * 주문앱도 exprism.co.kr 이라 탭 아이콘이 같이 바뀐다 — 같은 제품이니 그게 맞다.
 */
function applyBrandHead() {
  if (typeof window === 'undefined') return
  if (!/(^|\.)exprism\.co\.kr$/i.test(window.location.hostname)) return

  const set = (selector, attrs, tag = 'link') => {
    let el = document.head.querySelector(selector)
    if (!el) {
      el = document.createElement(tag)
      document.head.appendChild(el)
    }
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
  }

  set('link[rel="icon"]', { rel: 'icon', type: 'image/png', href: '/brand/exprism-icon-128.png' })
  set('link[rel="apple-touch-icon"]', { rel: 'apple-touch-icon', href: '/brand/exprism-icon-128.png' })
  set('meta[property="og:image"]', { property: 'og:image', content: 'https://www.exprism.co.kr/brand/exprism-og.jpg' }, 'meta')
  set('meta[property="og:site_name"]', { property: 'og:site_name', content: 'EXPRISM' }, 'meta')
}

applyBrandHead()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
