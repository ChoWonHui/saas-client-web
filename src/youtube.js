// 유튜브 URL 유틸 — 사장님 메뉴 편집기(MenuEditor)와 같은 규칙.
// watch?v= / youtu.be / embed / shorts / v/ 를 지원한다.

export function youtubeId(url) {
  if (!url) return null
  const m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/)
  return m ? m[1] : null
}

/** 목록/파사드용 썸네일. */
export function youtubeThumb(url) {
  const id = youtubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

/**
 * 재생 임베드(개인정보 보호 도메인).
 * 모바일은 '소리 있는 자동재생'을 막으므로 mute=1 이어야 자동재생이 보장된다
 * (플레이어에서 탭하면 소리가 켜진다). loop 로 짧은 소개 영상이 반복되게 한다.
 */
export function youtubeEmbed(url) {
  const id = youtubeId(url)
  if (!id) return null
  const p = `autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${id}`
  return `https://www.youtube-nocookie.com/embed/${id}?${p}`
}
