// 장바구니 계산 유틸. 옵션까지 반영한 단가·합계와, 서버 전송용 라인 변환.

export function won(n) {
  return `${(n ?? 0).toLocaleString()}원`
}

/** 선택 옵션들의 추가금 합계. */
export function optionsExtra(options) {
  return (options || []).reduce((s, o) => s + (o.extraPrice || 0), 0)
}

/** 옵션 포함 1개 단가. */
export function unitPrice(item, options) {
  return item.price + optionsExtra(options)
}

/** 옵션 라벨 문자열 — "곱빼기, 계란 추가" 형태(주문에 스냅샷으로 저장). */
export function optionsText(options) {
  return (options || []).map((o) => o.name).join(', ')
}

/** 같은 메뉴+같은 옵션조합이면 한 줄로 합친다. */
export function lineKey(itemId, options) {
  const ids = (options || []).map((o) => o.id).sort((a, b) => a - b).join('-')
  return `${itemId}::${ids}`
}

/** 서버 주문 요청 items 로 변환. */
export function toOrderItems(cart) {
  return cart.map((l) => ({
    menuItemId: l.itemId,
    menuName: l.name,
    unitPrice: l.unit,
    quantity: l.qty,
    optionsText: l.optionsText || null,
  }))
}
