import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getLang, setLang as persist, ui } from './i18n'
import { i18nApi } from './api/client'

// 손님 화면 전역 다국어 상태. 페이지가 번역할 텍스트를 registerTexts 로 등록하면
// 언어가 한국어가 아닐 때 서버 번역을 받아 tmap 에 채운다. 자식은 useI18n() 으로 tr/L 을 쓴다.
const Ctx = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getLang())
  const [texts, setTexts] = useState([])   // 현재 화면이 번역해야 할 원문들
  const [tmap, setTmap] = useState({})      // 원문 → 번역문
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    if (lang === 'ko' || texts.length === 0) { setTmap({}); return undefined }
    let alive = true
    setTranslating(true)
    i18nApi.translate(lang, texts)
      .then((r) => { if (alive) setTmap(r?.translations || {}) })
      .catch(() => { if (alive) setTmap({}) })
      .finally(() => { if (alive) setTranslating(false) })
    return () => { alive = false }
  }, [lang, texts])

  const value = useMemo(() => ({
    lang,
    translating,
    changeLang: (c) => { setLangState(c); persist(c) },
    registerTexts: setTexts,                       // 페이지가 번역 대상 원문을 등록
    tr: (t) => (lang === 'ko' || !t ? t : (tmap[t] || t)), // 콘텐츠 번역(폴백=원문)
    L: (key) => ui(key, lang),                     // UI 문구 번역
  }), [lang, tmap, translating])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// 프로바이더 밖에서도 안전하게 동작하도록 한국어 기본값을 돌려준다.
export function useI18n() {
  return useContext(Ctx) || {
    lang: 'ko', translating: false, changeLang: () => {}, registerTexts: () => {},
    tr: (t) => t, L: (key) => ui(key, 'ko'),
  }
}
