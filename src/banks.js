// 계좌이체 도우미 — 은행 목록은 서버 공통코드(BANK_LAUNCHER_URL ⋈ BANK_CD)에서 받는다.
// 각 은행의 실행 URL(스킴 또는 HTTPS 런처)에 치환자를 채워 연다.
//
//   토스:  supertoss://send?bank={bank}&accountNo={accountNo}   (계좌·금액 자동입력, 스킴)
//   신한:  https://nsol.shinhan.com/link.html?pr_id=...          (은행 공식 HTTPS 런처, 그대로 열림)
//
// 치환자: {bank}=토스표기 은행명, {accountNo}=숫자만, {amount}=금액(없으면 제거).
// HTTPS(런처)면 그 페이지가 앱 실행/스토어 폴백을 알아서 처리하므로 그대로 연다.
// 커스텀 스킴이면 실행 시도 후 안 열리면 스토어로 폴백한다(토스만 스토어 폴백 보유).

function isAndroid() { return /Android/i.test(navigator.userAgent) }
function isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent) }
export function isMobile() { return isAndroid() || isIOS() }

/** 실제로 열 수 있는 URL 인가 — 스킴(supertoss:// , intent:// , https:// 등)이 있어야 한다.
 *  "viva.republica.toss" 같은 패키지명만 넣은 값은 스킴이 없어 못 연다 → 무시하고 폴백한다. */
function launchable(u) {
  return !!u && /^[a-z][a-z0-9+.-]*:/i.test(u.trim())
}

/**
 * 은행 항목에서 접속 기기에 맞는 실행 URL을 고른다.
 *  - 안드로이드: androidUrl(비고2) 우선, 없으면 url(비고1)로 폴백
 *  - 그 외(iOS·데스크톱): url(비고1) 우선, 없으면 androidUrl로 폴백
 * 단, 스킴이 없는 값(예: 패키지명만 입력)은 못 열므로 건너뛰고 반대편으로 폴백한다.
 */
export function pickLauncherUrl(bank) {
  const ios = launchable(bank?.url) ? bank.url.trim() : ''
  const and = launchable(bank?.androidUrl) ? bank.androidUrl.trim() : ''
  return isAndroid() ? (and || ios) : (ios || and)
}

/** 텍스트를 클립보드에 복사(https 폴백 포함). */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch { /* 복사 실패해도 번호는 화면에 보인다 */ }
    ta.remove()
  }
}

/** 계좌 표시 은행명("신한은행")을 토스가 인식하는 표기("신한")로. 표에 없으면 "은행" 접미사만 뗀다. */
export function tossBankName(bankName) {
  const s = (bankName || '').trim()
  const MAP = {
    '신한은행': '신한', '국민은행': '국민', 'KB국민은행': '국민', '우리은행': '우리',
    '하나은행': '하나', 'KEB하나은행': '하나', '농협은행': '농협', 'NH농협은행': '농협', 'NH농협': '농협',
    '기업은행': '기업', 'IBK기업은행': '기업', '카카오뱅크': '카카오뱅크', '케이뱅크': '케이뱅크',
    '토스뱅크': '토스뱅크', '새마을금고': '새마을금고', '우체국': '우체국',
    '수협은행': '수협', 'SC제일은행': 'SC제일', '씨티은행': '씨티', '한국씨티은행': '씨티',
    '부산은행': '부산', '대구은행': '대구', 'iM뱅크': '대구', '광주은행': '광주',
    '전북은행': '전북', '경남은행': '경남', '제주은행': '제주', '산업은행': '산업', 'KDB산업은행': '산업',
    '신협': '신협', '저축은행': '저축',
  }
  return MAP[s] || s.replace(/은행$/, '')
}

/** URL 의 치환자를 가게 계좌 값으로 채운다. amount 가 없으면 amount 파라미터는 제거한다. */
function fillUrl(rawUrl, account, amount) {
  const bank = tossBankName(account?.bankName)
  const accountNo = (account?.accountNo || '').replace(/[^0-9]/g, '')
  let url = String(rawUrl || '')
    .replaceAll('{bank}', encodeURIComponent(bank))
    .replaceAll('{accountNo}', accountNo)
    .replaceAll('{amount}', amount && amount > 0 ? String(Math.floor(amount)) : '')
  // 금액이 없어 비어버린 amount 파라미터는 깔끔히 제거한다.
  url = url.replace(/([?&])amount=(?=&|$)/g, '$1').replace(/[?&]$/, '').replace(/&&/g, '&').replace(/\?&/, '?')
  return url
}

/**
 * 은행 런처 URL 실행.
 *  - http(s) 런처: 그대로 연다(그 페이지가 앱/설치를 처리). 데스크톱은 새 탭.
 *  - 커스텀 스킴: 실행 시도 후 <b>안 열리면(미설치) onFail() 호출</b> — 화면이 "설치 안 됨" 안내를 띄운다.
 *    데스크톱은 앱이 없으니 바로 onFail().
 */
export function openLauncher(rawUrl, account, amount, onFail) {
  const url = fillUrl(rawUrl, account, amount)
  if (!url) return

  if (/^https?:\/\//i.test(url)) {
    if (!isMobile()) window.open(url, '_blank', 'noopener')
    else window.location.href = url
    return
  }

  // 커스텀 스킴 → 실행 시도, 1.5초 안에 앱이 안 뜨면(페이지가 그대로면) 미설치로 보고 안내.
  if (!isMobile()) { onFail?.(); return }
  let done = false
  const timer = setTimeout(() => {
    if (!done && document.visibilityState === 'visible') { done = true; onFail?.() }
  }, 1500)
  const cancel = () => { clearTimeout(timer); done = true }
  document.addEventListener('visibilitychange', cancel, { once: true })
  window.addEventListener('pagehide', cancel, { once: true })
  window.location.href = url
}
