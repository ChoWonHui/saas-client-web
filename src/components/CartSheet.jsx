import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { won } from '../cart'
import { useI18n } from '../i18n-context'
import { embedPostcode, preloadPostcode } from '../postcode'

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
export default function CartSheet({ cart, total, parcel = false, onClose, onQty, onRemove, onSubmit, submitting }) {
  const { tr, L } = useI18n()
  const [memo, setMemo] = useState('')
  const [method, setMethod] = useState(PAY_METHODS[0].key)
  // 택배 배송지 (parcel 모드에서만)
  const [ship, setShip] = useState({ recipient: '', phone: '', postalCode: '', address: '', addressDetail: '' })
  const setS = (k) => (e) => setShip((p) => ({ ...p, [k]: e.target.value }))

  // 주소 검색(임베드) 오버레이 상태 + 위젯을 넣을 컨테이너.
  const [postOpen, setPostOpen] = useState(false)
  const postRef = useRef(null)

  // 택배면 우편번호 서비스를 미리 받아둔다(검색창 지연 줄이기).
  useEffect(() => { if (parcel) preloadPostcode() }, [parcel])

  // 오버레이가 열리면 그 안에 우편번호 검색 위젯을 임베드한다(모바일 안정 — 팝업창 아님).
  useEffect(() => {
    if (!postOpen || !postRef.current) return
    embedPostcode(
      postRef.current,
      ({ zonecode, address }) => { setShip((p) => ({ ...p, postalCode: zonecode, address })); setPostOpen(false) },
      () => setPostOpen(false),
      (e) => { alert(e.message); setPostOpen(false) },
    )
  }, [postOpen])

  function searchAddress() { setPostOpen(true) }

  // 택배는 수령인·연락처·주소가 있어야 결제 가능.
  const shipReady = !parcel || (ship.recipient.trim() && ship.phone.trim() && ship.address.trim())

  function handleSubmit() {
    if (parcel) {
      onSubmit(memo, method, {
        recipient: ship.recipient.trim(),
        phone: ship.phone.trim(),
        postalCode: ship.postalCode.trim() || null,
        address: ship.address.trim(),
        addressDetail: ship.addressDetail.trim() || null,
      })
    } else {
      onSubmit(memo, method)
    }
  }

  return (
    <>
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

          {parcel && (
            <div className="ship">
              <div className="ship-title"><Icon name="local_shipping" /> {L('shipTitle')}</div>
              <div className="ship-grid">
                <input className="ship-input" placeholder={L('shipRecipient')} maxLength={50}
                  value={ship.recipient} onChange={setS('recipient')} />
                <input className="ship-input" placeholder={L('shipPhone')} maxLength={30} inputMode="tel"
                  value={ship.phone} onChange={setS('phone')} />
                {/* 우편번호·주소는 직접 입력 막고, '주소 검색' 으로만 채운다(오입력 방지). */}
                <input className="ship-input ship-readonly" placeholder={L('shipPostal')}
                  value={ship.postalCode} readOnly onClick={searchAddress} />
                <button type="button" className="ship-search" onClick={searchAddress}>
                  <Icon name="search" /> {L('shipSearch')}
                </button>
                <input className="ship-input ship-wide ship-readonly" placeholder={L('shipAddr')}
                  value={ship.address} readOnly onClick={searchAddress} />
                <input className="ship-input ship-wide" placeholder={L('shipAddrDetail')} maxLength={255}
                  value={ship.addressDetail} onChange={setS('addressDetail')} />
              </div>
            </div>
          )}

          <textarea
            className="cart-memo"
            rows={2}
            maxLength={300}
            placeholder={parcel ? L('memoPlaceholderParcel') : L('memoPlaceholder')}
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
          <button className="btn-primary" disabled={submitting || cart.length === 0 || !shipReady} onClick={handleSubmit}>
            {submitting ? L('paying') : !shipReady ? L('shipNeed') : `${won(total)} ${L('payNow')}`}
          </button>
        </div>
      </div>
    </div>

    {/* 주소 검색 — 화면 안 임베드(모바일에서 팝업창보다 안정적). */}
    {postOpen && (
      <div className="post-overlay" onClick={(e) => { if (e.target === e.currentTarget) setPostOpen(false) }}>
        <div className="post-box" onClick={(e) => e.stopPropagation()}>
          <div className="post-head">
            <span>{L('shipSearch')}</span>
            <button className="sheet-close" onClick={() => setPostOpen(false)} aria-label="닫기"><Icon name="close" /></button>
          </div>
          <div className="post-embed" ref={postRef} />
        </div>
      </div>
    )}
    </>
  )
}
