import { useState } from 'react'
import { useI18n } from '../i18n-context'

/**
 * 입금 계좌 안내(정보 표시, 한 줄·소형).
 *
 * 계좌번호는 개인정보라 기본은 마스킹하고 "보기"를 눌러야 전체가 보인다.
 * 복사 버튼은 없다 — 실제 송금은 시트 하단 {@link BankSendBar} 의 "송금하기"가 담당하고,
 * 그때 계좌번호가 자동 복사된다.
 *
 * account 가 없으면(가게가 계좌를 등록하지 않았으면) 아무것도 그리지 않는다.
 */
export default function BankAccountBox({ account }) {
  const { L } = useI18n()
  const [shown, setShown] = useState(false)

  if (!account?.accountNo) return null

  const digits = String(account.accountNo)
  const shownNo = shown ? digits : maskAccount(digits)

  return (
    <div className="bank-line">
      <span className="bank-label">{L('bankTitle')}</span>
      <span className="bank-val">
        {account.bankName} {shownNo}
        {shown && account.accountHolder ? ` · ${account.accountHolder}` : ''}
      </span>
      <button type="button" className="bank-reveal" onClick={() => setShown((s) => !s)}>
        {shown ? L('bankHide') : L('bankShow')}
      </button>
    </div>
  )
}

/** 계좌번호 마스킹 — 앞 3자리·뒤 4자리만 남기고 가운데를 가린다. */
function maskAccount(no) {
  const s = String(no || '')
  if (s.length <= 8) return s.replace(/./g, (c, i) => (i === 0 || i >= s.length - 2 ? c : '•'))
  return s.slice(0, 3) + '•'.repeat(s.length - 7) + s.slice(-4)
}
