// 이 기기에서 넣은 주문 id 기억 — 포장처럼 테이블이 없을 때 '내 주문 내역' 조회에 쓴다.
// (테이블 주문은 테이블코드로 서버에서 바로 조회하므로 굳이 필요 없다.)

const key = (tenantCode) => `myorders:${tenantCode}`

export function loadOrderIds(tenantCode) {
  try { return JSON.parse(localStorage.getItem(key(tenantCode)) || '[]') } catch { return [] }
}

export function rememberOrder(tenantCode, orderId) {
  if (!orderId) return
  try {
    const arr = loadOrderIds(tenantCode)
    if (!arr.includes(orderId)) {
      arr.push(orderId)
      localStorage.setItem(key(tenantCode), JSON.stringify(arr.slice(-30))) // 최근 30건만
    }
  } catch { /* noop */ }
}
