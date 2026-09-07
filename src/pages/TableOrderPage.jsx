import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import OptionSheet from '../components/OptionSheet'
import CartSheet from '../components/CartSheet'
import MyOrdersSheet from '../components/MyOrdersSheet'
import ShopInfoSheet from '../components/ShopInfoSheet'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { shopApi } from '../api/client'
import { requestPayment } from '../payment'
import { rememberOrder, loadOrderIds } from '../myorders'
import { won, unitPrice, optionsText, lineKey, toOrderItems } from '../cart'
import { useI18n } from '../i18n-context'

export default function TableOrderPage({ mode = 'table' }) {
  const { tenantCode, tableCode } = useParams()
  const navigate = useNavigate()
  const takeout = mode === 'takeout'
  const { lang, changeLang, translating, tr, L, registerTexts } = useI18n()

  const [loading, setLoading] = useState(true)
  const [fatal, setFatal] = useState('')
  const [stopped, setStopped] = useState(false) // 포장주문 정지 상태
  const [shop, setShop] = useState(null)
  const [categories, setCategories] = useState([])

  const [activeCat, setActiveCat] = useState(null)
  const [optionItem, setOptionItem] = useState(null) // 옵션 시트 대상
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [placed, setPlaced] = useState(null) // 주문 완료 결과
  const [toast, setToast] = useState('')
  const [myOrders, setMyOrders] = useState([]) // 종료 전 내 주문
  const [myOpen, setMyOpen] = useState(false)
  const [home, setHome] = useState(null)       // 가게 메인 페이지 콘텐츠
  const [infoOpen, setInfoOpen] = useState(false)
  const [ad, setAd] = useState(null)           // 본사 공통 광고(테이블 주문 화면에만 노출)

  // 주문 가능 여부는 서버가 정한다(요금제). FREE 는 결제가 없어 메뉴판만 보여준다.
  // 서버도 같은 값으로 주문 API 를 막으므로 화면만 숨기는 눈속임이 아니다.
  const canOrder = shop?.orderEnabled !== false

  const sectionRefs = useRef({})
  const toastTimer = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 1800)
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setFatal('')
    setStopped(false)
    const head = takeout ? shopApi.takeout(tenantCode) : shopApi.table(tenantCode, tableCode)
    Promise.all([head, shopApi.menu(tenantCode)])
      .then(([t, m]) => {
        if (!alive) return
        if (takeout) {
          // 포장주문이 꺼져 있으면 '정지' 화면(이미 인쇄된 QR로 들어온 경우).
          if (!t.takeoutAvailable) { setShop(t); setStopped(true); return }
          setShop({ ...t, tableLabel: '포장 주문' })
        } else {
          setShop(t)
        }
        const cats = (m.categories || []).filter((c) => (c.items || []).length > 0)
        setCategories(cats)
        setActiveCat(cats[0]?.id ?? null)
      })
      .catch((e) => {
        if (!alive) return
        // 운영중이 아닌 가게·없는 업체코드/테이블(404) → EXPRISM 회사 소개(root)로.
        if (e.status === 404) { navigate('/', { replace: true }); return }
        setFatal(e.message)
      })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [tenantCode, tableCode, takeout])

  // 내 주문 내역 — 테이블은 테이블코드로, 포장은 이 기기에 기억한 주문 id 로 조회. 종료/취소는 뺀다.
  const loadMyOrders = useCallback(async () => {
    try {
      let list
      if (takeout) {
        const ids = loadOrderIds(tenantCode)
        list = ids.length ? await shopApi.ordersByIds(tenantCode, ids) : []
      } else {
        list = await shopApi.tableOrders(tenantCode, tableCode)
      }
      setMyOrders((list || []).filter((o) => o.status !== 'CLOSED' && o.status !== 'CANCELLED'))
    } catch { /* 조용히 무시 — 다음 폴링에서 재시도 */ }
  }, [takeout, tenantCode, tableCode])

  // 메뉴가 열려 있는 동안 12초마다 진행 상태 갱신.
  useEffect(() => {
    if (loading || fatal || stopped || !canOrder) return undefined
    loadMyOrders()
    const t = setInterval(loadMyOrders, 12000)
    return () => clearInterval(t)
  }, [loading, fatal, stopped, canOrder, loadMyOrders])

  // 가게 메인 페이지 콘텐츠(선택) — 실패해도 메뉴는 떠야 하므로 별도로 조용히 가져온다.
  useEffect(() => {
    let alive = true
    shopApi.home(tenantCode).then((h) => { if (alive) setHome(h) }).catch(() => {})
    // 본사 공통 광고 — 테이블 주문 화면 하단에 노출.
    shopApi.ad().then((a) => { if (alive && a?.enabled && a.imageUrl) setAd(a) }).catch(() => {})
    return () => { alive = false }
  }, [tenantCode])

  const totals = useMemo(() => {
    const count = cart.reduce((s, l) => s + l.qty, 0)
    const amount = cart.reduce((s, l) => s + l.unit * l.qty, 0)
    return { count, amount }
  }, [cart])

  // 번역 대상 텍스트(한줄소개·분류명·메뉴명·설명·옵션그룹명·옵션명)를 모아 컨텍스트에 등록.
  const menuTexts = useMemo(() => {
    const s = new Set()
    if (home?.tagline) s.add(home.tagline)
    categories.forEach((c) => {
      if (c.name) s.add(c.name)
      ;(c.items || []).forEach((it) => {
        if (it.name) s.add(it.name)
        if (it.description) s.add(it.description)
        ;(it.optionGroups || []).forEach((g) => {
          if (g.name) s.add(g.name)
          ;(g.options || []).forEach((o) => { if (o.name) s.add(o.name) })
        })
      })
    })
    return Array.from(s)
  }, [categories, home])
  useEffect(() => { registerTexts(menuTexts) }, [menuTexts, registerTexts])

  // 메뉴 담기 — 옵션이나 소개 영상이 있으면 상세 시트를 열고, 아니면 바로 담는다.
  function pickItem(item) {
    if (item.soldOut) return
    // 메뉴판 전용이면 담지 않고 상세만 띄운다(사진·설명·영상·옵션 안내).
    if (!canOrder) { setOptionItem(item); return }
    const hasDetail = (item.optionGroups || []).length > 0 || !!item.youtubeUrl
    if (hasDetail) { setOptionItem(item); return }
    addToCart({ item, options: [], qty: 1 })
    showToast(`${tr(item.name)} ${L('added')}`)
  }

  function addToCart({ item, options, qty }) {
    const key = lineKey(item.id, options)
    const unit = unitPrice(item, options)
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + qty) }
        return next
      }
      return [...prev, { key, itemId: item.id, name: item.name, unit, qty, optionsText: optionsText(options) }]
    })
    setOptionItem(null)
    showToast(`${tr(item.name)} ${L('added')}`)
  }

  function setQty(key, qty) {
    setCart((prev) => qty <= 0
      ? prev.filter((l) => l.key !== key)
      : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)))
  }
  function removeLine(key) { setCart((prev) => prev.filter((l) => l.key !== key)) }

  async function submit(memo, paymentMethod) {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      // 1) 결제 진행(현재는 모의결제, 나중에 실제 PG 로 교체) → 결제키 확보
      const pay = await requestPayment({ method: paymentMethod || 'CARD', amount: totals.amount })
      if (!pay.ok) { showToast(L('payFail')); return }
      // 2) 결제 결과를 실어 주문 접수
      const payload = {
        memo: memo || null,
        paymentMethod: pay.method,
        paymentKey: pay.paymentKey,
        items: toOrderItems(cart),
      }
      const res = takeout
        ? await shopApi.placeTakeoutOrder(tenantCode, payload)
        : await shopApi.placeOrder(tenantCode, tableCode, payload)
      rememberOrder(tenantCode, res.orderId) // 이 기기 주문으로 기억(포장 조회용)
      setPlaced(res)
      setCart([])
      setCartOpen(false)
      loadMyOrders() // 방금 넣은 주문을 바로 내역에 반영
    } catch (e) {
      // 접수 직전에 포장주문이 꺼진 경우 → 정지 화면으로.
      if (takeout && /정지/.test(e.message)) { setCartOpen(false); setStopped(true) }
      else showToast(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const catsRef = useRef(null)


  /**
   * 분류 탭을 누르면 그 분류로 이동한다.
   *
   * scrollIntoView({block:'start'}) 는 섹션을 화면 맨 위에 붙이는데,
   * 그 자리는 분류 탭 바(.cats, sticky top:0)가 덮고 있어 제목이 가려졌다.
   * 실제로 61px 짜리 바에 47px 가 잘렸다.
   *
   * 바 높이를 상수로 박으면 padding 이나 글자 크기가 바뀔 때 또 어긋난다.
   * 누르는 시점에 직접 재서 그만큼 위로 올린다.
   */
  /**
   * 화면 위쪽에 붙어 있는 것들이 실제로 덮는 높이.
   *
   * 처음에는 분류 탭 바(.cats, 61px)만 빼면 되는 줄 알았는데, 그 위에
   * 가게 배너(.topbar, 132px, z-index 30)가 같은 top:0 으로 겹쳐 있다.
   * 배너가 탭 바를 통째로 덮으므로 실제로 가려지는 높이는 132px 이고,
   * 61px 만 빼면 나머지 71px 이 배너 뒤에 남는다.
   *
   * 요소를 지정해 두면 나중에 하나가 더 붙거나 높이가 바뀔 때 또 어긋난다.
   * 상단에 고정된 것들을 훑어 가장 아래 끝을 찾는다.
   */
  function stickyOffset() {
    let bottom = 0
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.position !== 'sticky' && cs.position !== 'fixed') return
      const r = el.getBoundingClientRect()
      // 화면 맨 위에 붙어 있는 것만 센다. 하단 고정(장바구니 바)은 제외한다.
      if (r.height > 0 && r.top <= 1 && r.bottom > bottom && r.bottom < window.innerHeight / 2) {
        bottom = r.bottom
      }
    })
    return bottom
  }

  function scrollToCat(id) {
    setActiveCat(id)
    const el = sectionRefs.current[id]
    if (!el) return
    // 먼저 조금 내려 상단 요소들이 붙은 상태로 만든 뒤 높이를 잰다.
    // 맨 위에서는 배너가 아직 흐름 안에 있어 값이 달라진다.
    const offset = Math.max(stickyOffset(), 0)
    const y = el.getBoundingClientRect().top + window.scrollY - offset - 8
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }

  // ── 화면 상태 분기 ──
  if (loading) {
    return (
      <div className="screen">
        <div className="screen-inner"><div className="spinner" /><p style={{ marginTop: 18 }}>{L('loadingMenu')}</p></div>
      </div>
    )
  }
  if (fatal) {
    return (
      <div className="screen">
        <div className="screen-inner">
          <span className="material-symbols-outlined" style={{ color: 'var(--c-danger)' }}>error</span>
          <h2>{L('menuOpenFail')}</h2>
          <p>{fatal}<br />{L('menuOpenFailSub')}</p>
        </div>
      </div>
    )
  }
  if (stopped) {
    return (
      <div className="screen">
        <div className="screen-inner">
          <span className="material-symbols-outlined" style={{ color: 'var(--c-text-3)' }}>pause_circle</span>
          <h2>{L('takeoutStopTitle')}</h2>
          <p>{L('takeoutStopSub')}</p>
        </div>
      </div>
    )
  }
  if (placed) {
    return (
      <div className="screen">
        <div className="screen-inner">
          <span className="material-symbols-outlined done-check" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <h2>{L('payDone')}</h2>
          <p>{L('payDoneSub')}<br />{takeout ? L('payDoneTakeout') : L('payDoneTable')}</p>
          <span className="done-order-no">{L('orderNo')} {placed.orderNo} · {won(placed.totalAmount)}</span>
          <button className="btn-primary" onClick={() => setPlaced(null)}>{L('seeMoreMenu')}</button>
          <button className="myo-link" onClick={() => { setPlaced(null); setMyOpen(true) }}>{L('seeMyOrders')}</button>
        </div>
      </div>
    )
  }

  const showHome = home?.published
  const hasInfo = showHome && (home.intro || home.hours || home.phone || home.address || home.notice)

  return (
    <div className="app">
      {/* 상단바 = 대표 이미지 배너(있으면). 없으면 기본 흰 바. */}
      <div className={`topbar${home?.heroImageUrl ? ' topbar-hero' : ''}`}
           style={home?.heroImageUrl ? { backgroundImage: `url(${home.heroImageUrl})` } : undefined}>
        {home?.heroImageUrl && <div className="topbar-veil" />}
        <div className="topbar-left">
          <div className="topbar-shop">{shop?.shopName}</div>
          {home?.tagline && <div className="topbar-tag">{tr(home.tagline)}</div>}
          <span className="topbar-table"><Icon name={takeout ? 'takeout_dining' : 'table_restaurant'} />{takeout ? L('takeoutLabel') : tr(shop?.tableLabel)}</span>
        </div>
        <div className="topbar-right">
          {translating && <span className="lang-loading">{L('translating')}</span>}
          <LanguageSwitcher lang={lang} onChange={changeLang} />
          {canOrder && myOrders.length > 0 && (
            <button className="myo-btn" onClick={() => setMyOpen(true)}>
              <Icon name="receipt_long" /> {L('myOrders')}
              <span className="myo-count">{myOrders.length}</span>
            </button>
          )}
          {/* 가게 홈 — 가게 소개 랜딩(미니룸/소개)으로. 가게소개 메뉴판 뷰의 '가게 홈'과 동일. */}
          <button className="myo-btn home-btn" onClick={() => navigate(`/${tenantCode}`)}>
            <Icon name="cottage" /> {L('home')}
          </button>
        </div>
      </div>

      {!canOrder && (
        <div className="menuonly-bar">
          <Icon name="menu_book" />
          <span>{L('menuOnlyBar')}<br />{L('menuOnlyBar2')}</span>
        </div>
      )}

      {hasInfo && (
        <button className="shop-infobar" onClick={() => setInfoOpen(true)}>
          <Icon name="storefront" /> {shop?.shopName} · {L('infoView')} <Icon name="chevron_right" />
        </button>
      )}

      {categories.length > 1 && (
        <div className="cats" ref={catsRef}>
          {categories.map((c) => (
            <button key={c.id} className={`cat${activeCat === c.id ? ' on' : ''}`} onClick={() => scrollToCat(c.id)}>
              {tr(c.name)}
            </button>
          ))}
        </div>
      )}

      <div className={`menu${canOrder && totals.count > 0 ? ' with-cart' : ''}`}>
        {categories.length === 0 ? (
          <div className="empty">
            <Icon name="restaurant_menu" />
            <p>{L('emptyMenu')}</p>
          </div>
        ) : categories.map((c) => (
          <div key={c.id} ref={(el) => { sectionRefs.current[c.id] = el }}>
            <div className="menu-section"><h2>{tr(c.name)}</h2></div>
            <div className="menu-list">
              {c.items.map((it) => (
                <button key={it.id} className={`item${it.soldOut ? ' soldout' : ''}`} onClick={() => pickItem(it)} disabled={it.soldOut}>
                  <div className="item-thumb-wrap">
                    {it.imageUrl
                      ? <img className="item-thumb" src={it.imageUrl} alt="" />
                      : <div className="item-thumb ph"><Icon name="restaurant" /></div>}
                    {it.youtubeUrl && (
                      <span className="item-video-badge"><Icon name="play_arrow" filled />{L('video')}</span>
                    )}
                  </div>
                  <div className="item-main">
                    <div className="item-name">{tr(it.name)}</div>
                    {it.description && <div className="item-desc">{tr(it.description)}</div>}
                    <div className="item-bottom">
                      <span className="item-price">{won(it.price)}</span>
                      {it.soldOut
                        ? <span className="badge-soldout">{L('soldOut')}</span>
                        : canOrder && <span className="item-add"><Icon name="add" /></span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* 본사 공통 광고 — 메뉴 항목 바로 뒤(메뉴 스크롤 콘텐츠 안). 링크 있으면 새 탭. */}
        {ad && (
          ad.link
            ? <a className="ld-ad tbl-ad" href={ad.link} target="_blank" rel="noopener noreferrer"><span className="ld-ad-tag">AD</span><img src={ad.imageUrl} alt={ad.text || '광고'} />{ad.text && <span className="ld-ad-text">{ad.text}</span>}</a>
            : <div className="ld-ad tbl-ad"><span className="ld-ad-tag">AD</span><img src={ad.imageUrl} alt={ad.text || '광고'} />{ad.text && <span className="ld-ad-text">{ad.text}</span>}</div>
        )}

      </div>

      {canOrder && totals.count > 0 && (
        <div className="cartbar">
          <button className="cartbar-btn" onClick={() => setCartOpen(true)}>
            <span className="cartbar-left">
              <span className="cartbar-count">{totals.count}</span>
              {L('viewCart')}
            </span>
            <span className="cartbar-total">{won(totals.amount)}</span>
          </button>
        </div>
      )}

      {optionItem && (
        <OptionSheet item={optionItem} onClose={() => setOptionItem(null)} onAdd={addToCart} readOnly={!canOrder} />
      )}
      {cartOpen && (
        <CartSheet
          cart={cart}
          total={totals.amount}
          onClose={() => setCartOpen(false)}
          onQty={setQty}
          onRemove={removeLine}
          onSubmit={submit}
          submitting={submitting}
        />
      )}
      {myOpen && <MyOrdersSheet orders={myOrders} onClose={() => setMyOpen(false)} />}
      {infoOpen && home && <ShopInfoSheet home={home} shopName={shop?.shopName} onClose={() => setInfoOpen(false)} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
