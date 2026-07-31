import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import IsoRoom from '../components/IsoRoom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { shopApi } from '../api/client'
import { won } from '../cart'
import { youtubeEmbed, youtubeThumb } from '../youtube'
import { useI18n } from '../i18n-context'

function parseRoom(s) {
  if (!s) return null
  try {
    const r = JSON.parse(s)
    // v2 방이면(사장님 캐릭터가 항상 있으므로) 가구가 없어도 방을 보여준다.
    if (r?.v === 2 && Array.isArray(r.floors) && r.floors.length) return r
    return null
  } catch { return null }
}

/**
 * 가게 소개 랜딩 — /{업체코드} (테이블 없음). 가게 정체성 + 메뉴 소개(보기 전용).
 * 주문은 매장 테이블 QR( /{업체코드}/{테이블코드} )에서 한다.
 */
export default function StoreLandingPage() {
  const { tenantCode } = useParams()
  const navigate = useNavigate()
  // '메뉴판 보기' — 클릭하는 그 순간의 포장 여부를 새로 확인한다(사장님이 방금 껐/켰을 수 있으므로).
  // 포장 가능하면 포장 주문으로 바로, 아니면(불가·확인 실패) 원래 메뉴판을 보여준다. 절대 정지 페이지로 빠지지 않는다.
  const openMenu = async () => {
    try {
      const t = await shopApi.takeout(tenantCode)
      if (t?.takeoutAvailable) { navigate(`/${tenantCode}/takeout`); return }
    } catch { /* 확인 실패해도 메뉴는 보여준다 */ }
    setView('menu')
  }
  const [loading, setLoading] = useState(true)
  const [fatal, setFatal] = useState('')
  const [home, setHome] = useState(null)
  const [shopName, setShopName] = useState('')
  const [categories, setCategories] = useState([])
  const [ad, setAd] = useState(null) // 본사 공통 광고 — 메뉴판 뷰에만 노출
  const [view, setView] = useState('home') // 'home'(미니룸/가게소개) | 'menu'(메뉴판)
  const [introClamped, setIntroClamped] = useState(false) // 소개글이 칸을 넘쳐 잘렸는가(더보기 노출용)
  const [fullOpen, setFullOpen] = useState(false) // 가게 소개 전문 보기
  const [videoItem, setVideoItem] = useState(null) // 소개 영상 보기 대상 메뉴
  const introRef = useRef(null)
  const { lang, changeLang, translating, tr, L, registerTexts } = useI18n()

  // 번역해야 할 메뉴 텍스트(분류명·메뉴명·설명) 모음 — 중복 제거 후 컨텍스트에 등록.
  const menuTexts = useMemo(() => {
    const s = new Set()
    categories.forEach((c) => {
      if (c.name) s.add(c.name)
      ;(c.items || []).forEach((it) => {
        if (it.name) s.add(it.name)
        if (it.description) s.add(it.description)
      })
    })
    return Array.from(s)
  }, [categories])
  useEffect(() => { registerTexts(menuTexts) }, [menuTexts, registerTexts])

  // 영상/소개 모달이 열려 있는 동안 배경(메뉴 페이지) 스크롤을 잠근다.
  useEffect(() => {
    const open = !!videoItem || fullOpen
    document.body.classList.toggle('no-scroll', open)
    return () => document.body.classList.remove('no-scroll')
  }, [videoItem, fullOpen])

  useEffect(() => {
    let alive = true
    setLoading(true); setFatal('')
    Promise.all([shopApi.home(tenantCode), shopApi.menu(tenantCode)])
      .then(([h, m]) => {
        if (!alive) return
        setHome(h); setShopName(h.shopName || '')
        setCategories((m.categories || []).filter((c) => (c.items || []).length > 0))
      })
      .catch((e) => { if (alive) setFatal(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    // 광고는 메뉴판에서만 쓰지만, 실패해도 조용히.
    shopApi.ad().then((a) => { if (alive && a?.enabled && a.imageUrl) setAd(a) }).catch(() => {})
    return () => { alive = false }
  }, [tenantCode])

  // 소개글이 칸(line-clamp)을 넘쳐 잘렸는지 측정 → 넘칠 때만 '더보기'.
  useEffect(() => {
    const check = () => {
      const el = introRef.current
      setIntroClamped(!!el && el.scrollHeight > el.clientHeight + 1)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [home, view, loading])

  if (loading) {
    return <div className="screen"><div className="screen-inner"><div className="spinner" /><p style={{ marginTop: 18 }}>{L('loading')}</p></div></div>
  }
  if (fatal) {
    return (
      <div className="screen"><div className="screen-inner">
        <span className="material-symbols-outlined" style={{ color: 'var(--c-danger)' }}>error</span>
        <h2>{L('notFound')}</h2>
        <p>{fatal}</p>
      </div></div>
    )
  }

  const pub = home?.published
  const room = pub ? parseRoom(home.miniroom) : null

  // 가게 홈(store deco) 하단 — 가게 소개 글. 광고 아님. **소개글이 없어도 항상 보인다**(준비중 안내).
  const hasRows = home?.hours || home?.phone || home?.address
  const shopInfo = (
    <section className="ld-shopinfo">
      <div className="ld-shopinfo-in">
        {home?.notice && <div className="ld-notice"><Icon name="campaign" />{home.notice}</div>}
        {home?.intro
          ? <p ref={introRef} className="ld-intro">{home.intro}</p>
          : <p className="ld-intro ld-intro-empty">{L('introPreparing')}</p>}
        {hasRows && (
          <div className="ld-rows">
            {home.hours && <div className="ld-row"><Icon name="schedule" /><span>{home.hours}</span></div>}
            {home.phone && <a className="ld-row link" href={`tel:${home.phone}`}><Icon name="call" /><span>{home.phone}</span></a>}
            {home.address && <div className="ld-row"><Icon name="location_on" /><span>{home.address}</span></div>}
          </div>
        )}
        {introClamped && (
          <button type="button" className="ld-more" onClick={() => setFullOpen(true)}>{L('more')}</button>
        )}
      </div>
    </section>
  )

  // 광고 — 메뉴판 뷰에만. 링크 있으면 새 탭.
  const adInner = ad ? (
    <>
      <span className="ld-ad-tag">AD</span>
      <img src={ad.imageUrl} alt={ad.text || '광고'} />
      {ad.text && <span className="ld-ad-text">{ad.text}</span>}
    </>
  ) : null
  const adBanner = adInner
    ? (ad.link
      ? <a className="ld-ad" href={ad.link} target="_blank" rel="noopener noreferrer">{adInner}</a>
      : <div className="ld-ad">{adInner}</div>)
    : null

  return (
    <div className={`app landing${view === 'home' ? ' landing-home' : ''}`}>
      {/* 상단 바 — 대표 이미지는 '메뉴판 보기' 뷰에서만 배경으로(가게 홈은 미니룸이 메인이라 제외). */}
      {(() => { const heroBar = view === 'menu' && !!home?.heroImageUrl; return (
      <div className={`ld-topbar${heroBar ? ' ld-topbar-hero' : ''}`}
           style={heroBar ? { backgroundImage: `url(${home.heroImageUrl})` } : undefined}>
        {heroBar && <div className="ld-topbar-veil" />}
        <div className="ld-topbar-name">{shopName || '우리 가게'}</div>
        {view === 'home' ? (
          <button className="ld-tab-btn" onClick={openMenu}>
            <Icon name="restaurant_menu" /> {L('menuTab')}
          </button>
        ) : (
          <div className="ld-topbar-right">
            {translating && <span className="lang-loading">{L('translating')}</span>}
            <LanguageSwitcher lang={lang} onChange={changeLang} />
            <button className="ld-tab-btn ghost" onClick={() => setView('home')}>
              <Icon name="cottage" /> {L('home')}
            </button>
          </div>
        )}
      </div>
      ) })()}

      {view === 'home' ? (
        <>
          {/* 가게 정체성(store deco) — 미니룸(있으면), 없으면 히어로 이미지. 남는 높이를 채운다. */}
          {room ? (
            <div className="ld-room">
              <IsoRoom data={room} />
              {pub && home.tagline && (
                <div className="ld-room-title"><div className="ld-room-tag">{home.tagline}</div></div>
              )}
            </div>
          ) : (
            <div className="ld-hero" style={pub && home.heroImageUrl ? { backgroundImage: `url(${home.heroImageUrl})` } : undefined}>
              <div className="ld-hero-veil" />
              <div className="ld-hero-text">
                <div className="ld-shop">{shopName || '우리 가게'}</div>
                {pub && home.tagline && <div className="ld-tag">{home.tagline}</div>}
              </div>
            </div>
          )}

          {/* store deco 하단 — 가게 소개. 뷰포트에 맞춰 스크롤 없이. */}
          <div className="ld-landing-bottom">
            {shopInfo}
          </div>
        </>
      ) : (
        <>
          {/* 메뉴판 (보기 전용, 영상 있는 메뉴는 탭하면 소개 영상). 포장 가능 가게는 '메뉴판 보기'가 포장으로 바로 가므로 이 뷰는 포장 불가일 때만 보인다. */}
          {categories.length === 0 ? (
            <div className="empty"><Icon name="restaurant_menu" /><p>{L('emptyMenu')}</p></div>
          ) : (
            <section className="ld-menu">
              {categories.map((c) => (
                <div key={c.id} className="ld-cat">
                  <h3 className="ld-cat-name">{tr(c.name)}</h3>
                  <div className="menu-list">
                    {c.items.map((it) => {
                      const hasVideo = !!it.youtubeUrl
                      return (
                      <div
                        key={it.id}
                        className={`item view${it.soldOut ? ' soldout' : ''}${hasVideo ? ' has-video' : ''}`}
                        onClick={hasVideo ? () => setVideoItem(it) : undefined}
                        role={hasVideo ? 'button' : undefined}
                      >
                        <div className="item-thumb-wrap">
                          {it.imageUrl
                            ? <img className="item-thumb" src={it.imageUrl} alt="" />
                            : <div className="item-thumb ph"><Icon name="restaurant" /></div>}
                          {hasVideo && <span className="item-video-badge"><Icon name="play_arrow" filled />{L('video')}</span>}
                        </div>
                        <div className="item-main">
                          <div className="item-name">{tr(it.name)}</div>
                          {it.description && <div className="item-desc">{tr(it.description)}</div>}
                          <div className="item-bottom">
                            <span className="item-price">{won(it.price)}</span>
                            {it.soldOut && <span className="badge-soldout">{L('soldOut')}</span>}
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}
          {adBanner}
        </>
      )}

      {/* 가게 소개 전문(더보기) */}
      {fullOpen && (
        <div className="ld-full-backdrop" onClick={() => setFullOpen(false)}>
          <div className="ld-full" onClick={(e) => e.stopPropagation()}>
            <div className="ld-full-head">
              <span>{L('storeInfo')}</span>
              <button type="button" className="ld-full-x" onClick={() => setFullOpen(false)} aria-label="닫기"><Icon name="close" /></button>
            </div>
            {home?.notice && <div className="ld-notice"><Icon name="campaign" />{home.notice}</div>}
            <p className="ld-full-intro">{home?.intro}</p>
            {hasRows && (
              <div className="ld-rows">
                {home.hours && <div className="ld-row"><Icon name="schedule" /><span>{home.hours}</span></div>}
                {home.phone && <a className="ld-row link" href={`tel:${home.phone}`}><Icon name="call" /><span>{home.phone}</span></a>}
                {home.address && <div className="ld-row"><Icon name="location_on" /><span>{home.address}</span></div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 메뉴 소개 영상 */}
      {videoItem && (
        <div className="ld-full-backdrop" onClick={() => setVideoItem(null)}>
          <div className="ld-video" onClick={(e) => e.stopPropagation()}>
            <div className="ld-full-head">
              <span>{tr(videoItem.name)}</span>
              <button type="button" className="ld-full-x" onClick={() => setVideoItem(null)} aria-label="닫기"><Icon name="close" /></button>
            </div>
            <div className="ld-video-frame" style={{ backgroundImage: `url(${youtubeThumb(videoItem.youtubeUrl)})` }}>
              <iframe
                src={youtubeEmbed(videoItem.youtubeUrl)}
                title={videoItem.name}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
              <span className="ld-video-mute"><Icon name="volume_off" filled />{L('tapForSound')}</span>
            </div>
            {videoItem.description && <p className="ld-video-desc">{tr(videoItem.description)}</p>}
            <div className="ld-video-foot">
              <span className="item-price">{won(videoItem.price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
