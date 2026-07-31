import { useEffect, useRef, useState } from 'react'
import { LANGS, langMeta } from '../i18n'

/**
 * 언어 선택기 — 지구본 버튼을 누르면 지원 언어 목록이 뜬다.
 * 바깥 클릭·Esc 로 닫힌다. 선택하면 onChange(code) 를 부른다.
 */
export default function LanguageSwitcher({ lang, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const meta = langMeta(lang)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  return (
    <div className={`lang-switch${open ? ' open' : ''}`} ref={wrapRef}>
      <button type="button" className="lang-btn" onClick={() => setOpen((v) => !v)} aria-label="Language">
        <span className="lang-flag">{meta.flag}</span>
        <span className="lang-cur">{meta.label}</span>
        <span className="material-symbols-outlined lang-caret">expand_more</span>
      </button>
      {open && (
        <ul className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                className={`lang-opt${l.code === lang ? ' on' : ''}`}
                onClick={() => { onChange(l.code); setOpen(false) }}
                role="option"
                aria-selected={l.code === lang}
              >
                <span className="lang-flag">{l.flag}</span>
                <span>{l.label}</span>
                {l.code === lang && <span className="material-symbols-outlined lang-check">check</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
