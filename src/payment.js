// 결제 게이트웨이 연결부(seam) — 손님이 '결제하기'를 누르면 여기서 결제를 진행한다.
//
// 지금은 모의결제: 잠깐 기다린 뒤 무조건 승인하고 모의 결제키를 돌려준다.
// 나중에 실제 PG(토스페이먼츠·카카오페이 등)를 붙일 때는 이 함수 하나만 교체하면 된다.
//   예) 토스: loadTossPayments(clientKey) → requestPayment(...) → 성공 시 paymentKey 반환
// 반환한 paymentKey 는 주문 요청에 실려 서버로 가고, 서버가 PaymentGateway.confirm 으로 최종 검증한다.

const MOCK_DELAY_MS = 500

function mockKey() {
  // 데모용 결제키. 실제 PG 라면 결제창에서 받은 값이 들어온다.
  return 'MOCK-' + Math.random().toString(36).slice(2, 12).toUpperCase()
}

/**
 * 결제를 요청한다.
 * @param {{ method: string, amount: number, orderName?: string }} req
 * @returns {Promise<{ ok: boolean, method: string, amount: number, paymentKey: string|null, message?: string }>}
 */
export async function requestPayment({ method, amount, orderName }) {
  // 실제 PG 연동 자리: 여기서 결제창(SDK/리다이렉트)을 띄우고 사용자의 결제 결과를 기다린다.
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
  return {
    ok: true,
    method: method || 'CARD',
    amount,
    orderName,
    paymentKey: mockKey(),
    message: '모의 결제 승인',
  }
}
