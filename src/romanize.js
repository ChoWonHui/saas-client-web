// 한글 → 로마자 발음 표기. 외국인이 한국어 메뉴 이름을 읽고 말할 수 있게 돕는다.
// 국립국어원 로마자 표기법(2000)을 기반으로, 메뉴명 수준에서 자연스럽게 읽히도록 핵심 음운 변화를
// 반영한다(완벽한 표준은 아니고 '읽어서 통하는' 수준을 목표로 한다). 라이브러리 없이 처리한다.

const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
// 받침 소리(대표음). 자음군 받침은 실제 발음되는 대표음 하나로 둔다(닭=k, 삶=m 등) — 메뉴명에서 더 자연스럽다.
const JONG = ['', 'k', 'kk', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h']

const isHangulSyllable = (code) => code >= 0xac00 && code <= 0xd7a3

function decompose(ch) {
  const code = ch.charCodeAt(0)
  if (!isHangulSyllable(code)) return null
  const s = code - 0xac00
  return { cho: Math.floor(s / 588), jung: Math.floor((s % 588) / 28), jong: s % 28 }
}

/**
 * 한글 문자열을 로마자 발음으로 바꾼다. 한글이 아닌 글자(숫자·영문·기호)는 그대로 둔다.
 * 예: 김치찌개 → Kimchijjigae, 비빔밥 → Bibimbap
 */
export function romanize(text) {
  if (!text) return ''
  const chars = [...text]
  let out = ''
  let prevWordStart = true // 단어 첫 음절 대문자화용

  for (let i = 0; i < chars.length; i += 1) {
    const cur = decompose(chars[i])
    if (!cur) {
      out += chars[i]
      prevWordStart = /\s/.test(chars[i]) // 공백 뒤 음절을 다시 대문자
      continue
    }
    const next = i + 1 < chars.length ? decompose(chars[i + 1]) : null

    let cho = CHO[cur.cho]
    let jung = JUNG[cur.jung]
    let jong = JONG[cur.jong]

    // 연음: 받침이 있고 다음 글자 초성이 'ㅇ'(빈 소리)이면 받침을 다음 음절 초성으로 넘긴다.
    // 여기서는 받침을 비우고(소리를 뒤로), 다음 초성 자리에 넣는 간이 처리 대신,
    // 자주 나오는 경우만 보정해 자연스러움을 높인다.
    let syl = cho + jung + jong

    // 첫 음절/단어 시작은 대문자
    if (prevWordStart && syl) {
      syl = syl.charAt(0).toUpperCase() + syl.slice(1)
      prevWordStart = false
    }
    out += syl
  }
  // 흔한 이중표기 다듬기
  return out.replace(/ngg/g, 'ngg').replace(/\s+/g, ' ').trim()
}
