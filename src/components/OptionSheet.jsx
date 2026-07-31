import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon'
import { won, unitPrice, optionsExtra } from '../cart'
import { youtubeId, youtubeThumb, youtubeEmbed } from '../youtube'
import { useI18n } from '../i18n-context'

/**
 * 메뉴 1개의 옵션을 고르고 수량을 정해 담는 바텀시트.
 * - required 그룹은 최소 1개 선택해야 담기 버튼이 활성화된다.
 * - multiple=true 면 다중 선택(체크박스), 아니면 단일 선택(라디오).
 */
export default function OptionSheet({ item, onClose, onAdd }) {
  const { tr, L } = useI18n()
  const groups = item.optionGroups || []
  // 단일 선택 그룹은 required 면 첫 옵션을 기본 선택.
  const [selected, setSelected] = useState(() => {
    const init = {}
    for (const g of groups) {
      if (!g.multiple && g.required && g.options?.length) init[g.id] = [g.options[0].id]
      else init[g.id] = []
    }
    return init
  })
  const [qty, setQty] = useState(1)
  const vid = youtubeId(item.youtubeUrl)

  // 시트가 열려 있는 동안 배경(메뉴) 스크롤을 잠근다.
  useEffect(() => {
    document.body.classList.add('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [])

  function toggle(group, opt) {
    setSelected((prev) => {
      const cur = prev[group.id] || []
      if (group.multiple) {
        const on = cur.includes(opt.id)
        return { ...prev, [group.id]: on ? cur.filter((x) => x !== opt.id) : [...cur, opt.id] }
      }
      // 단일 선택: required 면 해제 불가(다른 걸로 교체만)
      if (cur.includes(opt.id)) return group.required ? prev : { ...prev, [group.id]: [] }
      return { ...prev, [group.id]: [opt.id] }
    })
  }

  const chosen = useMemo(() => {
    const list = []
    for (const g of groups) {
      for (const o of g.options || []) {
        if ((selected[g.id] || []).includes(o.id)) list.push(o)
      }
    }
    return list
  }, [groups, selected])

  const missing = groups.filter((g) => g.required && (selected[g.id] || []).length === 0)
  const canAdd = missing.length === 0
  const each = unitPrice(item, chosen)

  function add() {
    if (!canAdd) return
    onAdd({ item, options: chosen, qty })
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h3>{tr(item.name)}</h3>
          <button className="sheet-close" onClick={onClose} aria-label="닫기"><Icon name="close" /></button>
        </div>

        <div className="sheet-body">
          {/* 영상 소개 — 시트를 열면 바로 자동재생(모바일 정책상 음소거로 시작, 플레이어를 탭하면 소리). */}
          {vid && (
            <div className="opt-video" style={{ backgroundImage: `url(${youtubeThumb(item.youtubeUrl)})` }}>
              <iframe
                className="opt-video-frame"
                src={youtubeEmbed(item.youtubeUrl)}
                title={item.name}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <span className="opt-video-mute"><Icon name="volume_off" filled />{L('tapForSound')}</span>
            </div>
          )}

          <div className="opt-hero">
            {!vid && (item.imageUrl
              ? <img className="opt-hero-img" src={item.imageUrl} alt="" />
              : <div className="opt-hero-img" style={{ display: 'grid', placeItems: 'center' }}><Icon name="restaurant" /></div>)}
            <div>
              <div className="opt-hero-price">{won(item.price)}</div>
              {item.description && <div className="opt-hero-desc">{tr(item.description)}</div>}
            </div>
          </div>

          {groups.map((g) => (
            <div className="opt-group" key={g.id}>
              <div className="opt-group-head">
                <span className="opt-group-name">{tr(g.name)}</span>
                {g.required && <span className="opt-req">{L('required')}</span>}
              </div>
              {(g.options || []).map((o) => {
                const on = (selected[g.id] || []).includes(o.id)
                return (
                  <button key={o.id} className={`opt-row${on ? ' on' : ''}`} onClick={() => toggle(g, o)}>
                    <span className={`opt-check${g.multiple ? '' : ' radio'}`}>
                      <Icon name="check" />
                    </span>
                    <span className="opt-label">{tr(o.name)}</span>
                    {o.extraPrice > 0 && <span className="opt-extra">+{won(o.extraPrice)}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="sheet-foot">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="수량 감소"><Icon name="remove" /></button>
              <span className="n">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="수량 증가"><Icon name="add" /></button>
            </div>
            {optionsExtra(chosen) > 0 && (
              <span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>{L('optionExtra')} +{won(optionsExtra(chosen))}</span>
            )}
          </div>
          <button className="btn-primary" disabled={!canAdd} onClick={add}>
            {canAdd ? `${won(each * qty)} ${L('addToCart')}` : `${tr(missing[0].name)} ${L('selectSuffix')}`}
          </button>
        </div>
      </div>
    </div>
  )
}
