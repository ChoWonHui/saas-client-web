import { useState } from 'react'
import Icon from './Icon'
import { won } from '../cart'
import { useI18n } from '../i18n-context'

// 선불 결제 수단(모의). label 은 i18n 키로 두고 화면에서 번역한다.
const PAY_METHODS = [
  { key: 'TRANSFER', labelKey: 'payTransfer', icon: 'account_balance' },
  { key: 'CARD', labelKey: 'payCard', icon: 'credit_card' },
  { key: 'KAKAO_PAY', labelKey: 'payKakao', icon: 'account_balance_wallet' },
  { key: 'TOSS_PAY', labelKey: 'payToss', icon: 'payments' },
]

/**
 * 장바구니 확인 → 선불 결제. 라인별 수량/삭제, 요청사항, 결제수단 선택 후 '결제하기'.
 * 결제가 끝나야 주문이 접수되어 조리가 시작된다.
 */
export default function CartSheet({ cart, total, onClose, onQty, onRemove, onSubmit, submitting }) {
  const { tr, L } = useI18n()
  const [memo, setMemo] = useState('')
  const [method, setMethod] = useState(PAY_METHODS[0].key)

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h3>{L('cart')}</h3>
          <button className="sheet-close" onClick={onClose} aria-label="닫기"><Icon name="close" /></button>
        </div>

        <div className="sheet-body">
          {cart.map((l) => (
            <div className="cart-line" key={l.key}>
              <div className="cart-line-main">
                <div className="cart-line-name">{tr(l.name)}</div>
                {l.optionsText && <div className="cart-line-opts">{l.optionsText}</div>}
                <div className="cart-line-foot">
                  <div className="stepper">
                    <button onClick={() => onQty(l.key, l.qty - 1)} aria-label="수량 감소">
                      <Icon name={l.qty <= 1 ? 'delete' : 'remove'} />
                    </button>
                    <span className="n">{l.qty}</span>
                    <button onClick={() => onQty(l.key, l.qty + 1)} aria-label="수량 증가"><Icon name="add" /></button>
                  </div>
                  <span className="cart-line-price">{won(l.unit * l.qty)}</span>
                </div>
              </div>
              <button className="cart-del" onClick={() => onRemove(l.key)} aria-label="삭제"><Icon name="close" /></button>
            </div>
          ))}

          <textarea
            className="cart-memo"
            rows={2}
            maxLength={300}
            placeholder={L('memoPlaceholder')}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          <div className="paym">
            <div className="paym-title">{L('payMethod')}</div>
            {PAY_METHODS.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`paym-row${method === m.key ? ' on' : ''}`}
                onClick={() => setMethod(m.key)}
              >
                <Icon name={m.icon} />
                <span className="paym-label">{L(m.labelKey)}</span>
                <span className={`paym-radio${method === m.key ? ' on' : ''}`}><Icon name="check" /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="sheet-foot">
          <div className="cart-total">
            <span className="label">{L('totalPay')}</span>
            <span className="amt">{won(total)}</span>
          </div>
          <button className="btn-primary" disabled={submitting || cart.length === 0} onClick={() => onSubmit(memo, method)}>
            {submitting ? L('paying') : `${won(total)} ${L('payNow')}`}
          </button>
        </div>
      </div>
    </div>
  )
}
