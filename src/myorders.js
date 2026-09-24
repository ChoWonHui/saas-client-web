// 이 기기에서 넣은 주문 id 를 localStorage 에 기억한다.
// 비로그인 정책이라 서버가 손님을 특정할 수 없으므로, 기기(브라우저)에 '내가 넣은 주문'을
// 기억해 '내 주문' 조회에 쓴다. 테이블·포장·택배 모두 동일.
// (모바일 웹앱 기준: iOS Safari 는 미접속 7일이면 이 저장소를 지우지만,
//  QR 주문은 당일~며칠 내 확인이라 실사용에 문제 없다.)

const key = (tenantCode) => `myorders:${tenantCode}`
const MAX = 30 // 최근 30건만

export function loadOrderIds(tenantCode) {
  try {
    const arr = JSON.parse(localStorage.getItem(key(tenantCode)) || '[]')
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function rememberOrder(tenantCode, orderId) {
  if (!orderId) return
  try {
    const arr = loadOrderIds(tenantCode)
    if (!arr.includes(orderId)) {
      arr.push(orderId)
      localStorage.setItem(key(tenantCode), JSON.stringify(arr.slice(-MAX)))
    }
  } catch { /* noop */ }
}
