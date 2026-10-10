// 메뉴 이름을 소리로 읽어준다(한국어 발음). 브라우저 내장 SpeechSynthesis 라 API 비용이 없다.
// 외국인이 "이걸 어떻게 발음하지?" 할 때 🔊 를 눌러 듣고 따라 말할 수 있게 한다.

let koVoice // 한국어 음성(있으면) 캐시

function pickKoVoice() {
  if (koVoice) return koVoice
  try {
    const voices = window.speechSynthesis.getVoices() || []
    koVoice = voices.find((v) => /ko(-|_)?/i.test(v.lang)) || null
  } catch { koVoice = null }
  return koVoice
}

// 음성 목록은 늦게 로드되기도 한다 — 준비되면 다시 고른다.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { koVoice = null; pickKoVoice() }
}

export function speakSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** 한국어 텍스트를 읽는다(원어 발음). 이전 재생은 끊고 새로 읽는다. */
export function speakKorean(text) {
  if (!speakSupported() || !text) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ko-KR'
    const v = pickKoVoice()
    if (v) u.voice = v
    u.rate = 0.9 // 조금 천천히 — 따라 말하기 쉽게
    window.speechSynthesis.speak(u)
  } catch { /* 지원 안 하면 조용히 무시 */ }
}
