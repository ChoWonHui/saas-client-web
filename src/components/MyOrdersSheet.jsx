import Icon from './Icon'
import { won } from '../cart'
import { useI18n } from '../i18n-context'

// 주문 상태 → 라벨키 + (완료된 단계 수 done, 현재 진행 단계 now). 단계: 접수·조리·서빙.
const STATUS = {
  WAITING: { key: 'stWAITING', done: 0, now: 0 },
  RECEIVED: { key: 'stRECEIVED', done: 1, now: 0 },
  COOKING: { key: 'stCOOKING', done: 1, now: 1 },
  READY: { key: 'stREADY', done: 2, now: 2 },
  SERVING: { key: 'stSERVING', done: 2, now: 2 },
  SERVED: { key: 'stSERVED', done: 3, now: -1 },
  CLOSED: { key: 'stCLOSED', done: 3, now: -1 },
  CANCELLED: { key: 'stCANCELLED', done: 0, now: -1 },
}
const STEP_KEYS = ['stepReceived', 'stepCooking', 'stepServing']

function time(dt) { return dt ? dt.slice(11, 16) : '' }

/** 내 주문 내역 — 종료 전까지의 주문과 진행 상태를 보여준다(읽기 전용, 부모가 주기적으로 갱신). */
export default function MyOrdersSheet({ orders, onClose }) {
  const { tr, L } = useI18n()
  const total = orders.reduce((s, o) => s + o.totalAmount, 0)
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h3>{L('myOrdersTitle')}</h3>
          <button className="sheet-close" onClick={onClose} aria-label="닫기"><Icon name="close" /></button>
        </div>

        <div className="sheet-body">
          {orders.length === 0 ? (
            <div className="myo-empty"><Icon name="receipt_long" /><p>{L('noOrders')}</p></div>
          ) : orders.map((o) => {
            const st = STATUS[o.status]
            const label = st ? L(st.key) : o.status
            const done = st ? st.done : 0
            const now = st ? st.now : -1
            const cancelled = o.status === 'CANCELLED'
            return (
              <div className={`myo-order${cancelled ? ' cancelled' : ''}`} key={o.orderId}>
                <div className="myo-head">
                  <span className="myo-no">{o.orderNo} · {time(o.createdAt)}</span>
                  <span className={`myo-status${cancelled ? ' cancel' : done >= 3 ? ' done' : ''}`}>{label}</span>
                </div>
                {!cancelled && (
                  <div className="myo-steps">
                    {STEP_KEYS.map((s, i) => (
                      <div className={`myo-step${i < done ? ' done' : ''}${i >= done && i === now ? ' now' : ''}`} key={s}>
                        <span className="myo-dot"><Icon name="check" /></span>
                        <span className="myo-step-label">{L(s)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <ul className="myo-lines">
                  {(o.items || []).map((it, i) => (
                    <li key={i}>
                      <span className="myo-q">{it.quantity}</span>
                      <span className="myo-n">{tr(it.menuName)}{it.optionsText && <em> · {it.optionsText}</em>}</span>
                      <span className="myo-a">{won(it.lineAmount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {orders.length > 0 && (
          <div className="sheet-foot">
            <div className="cart-total"><span className="label">{L('orderTotal')}</span><span className="amt">{won(total)}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}
