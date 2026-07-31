import Icon from './Icon'

/** 가게 정보 시트 — 소개/영업시간/전화/주소/공지. */
export default function ShopInfoSheet({ home, shopName, onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h3>{shopName} 정보</h3>
          <button className="sheet-close" onClick={onClose} aria-label="닫기"><Icon name="close" /></button>
        </div>
        <div className="sheet-body">
          {home.notice && <div className="si-notice"><Icon name="campaign" />{home.notice}</div>}
          {home.intro && <p className="si-intro">{home.intro}</p>}
          <div className="si-rows">
            {home.hours && <div className="si-row"><Icon name="schedule" /><span>{home.hours}</span></div>}
            {home.phone && (
              <a className="si-row link" href={`tel:${home.phone}`}><Icon name="call" /><span>{home.phone}</span></a>
            )}
            {home.address && <div className="si-row"><Icon name="location_on" /><span>{home.address}</span></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
