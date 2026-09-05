import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import '../../company.css'
import { BRAND, NAV, NAV_FLAT, CONTACT } from '../../company-data'

/**
 * 회사 사이트의 공통 껍데기 — 상단바 + 내비게이션 + 푸터.
 * 원본(kanchenjunga-nodejs/public)의 js/header.js · js/footer.js 를 컴포넌트로 옮긴 것이다.
 *
 * solidHeader: 히어로가 없는 화면(회사소개·사업영역·공지·문의)은 처음부터 흰 헤더여야 한다.
 *   히어로가 있는 메인만 투명하게 시작해 스크롤하면 흰색으로 바뀐다.
 */
export default function SiteShell({ children, solidHeader = false, title }) {
  // index.html 의 제목은 주문앱 기준("테이블 주문")이다. 회사 사이트 화면에서만 바꾼다.
  useEffect(() => {
    document.title = title ? `${title} - ${BRAND.name}` : `${BRAND.name} - ${BRAND.subKo}`
  }, [title])

  return (
    <div className="kc">
      <SiteHeader solid={solidHeader} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}

function SiteHeader({ solid }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const sentinelRef = useRef(null)

  // 스크롤이 내려가면 헤더에 흰 배경을 깔아 본문과 겹쳐 읽히지 않게 한다.
  //
  // scroll 이벤트를 듣지 않고 문서 맨 위에 둔 감지용 요소(sentinel)가 화면에서
  // 벗어나는지로 판단한다. scroll 리스너는 스크롤 프레임마다 실행돼 setState 를
  // 때리지만, IntersectionObserver 는 경계를 넘을 때 한 번만 알려준다.
  useEffect(() => {
    if (solid) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [solid])

  // 화면을 이동하면 드로어를 닫는다.
  useEffect(() => setOpen(false), [location.pathname])

  // 열려 있는 동안 Esc 로 닫고, 뒤 본문 스크롤을 잠근다.
  // (프로젝트 공통 규칙 — index.css 의 body.no-scroll 을 그대로 쓴다)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [open])

  const isSolid = solid || scrolled

  return (
    <>
      {/* 문서 맨 위 9px. 레이아웃에 영향을 주지 않도록 흐름에서 빼 둔다.
          이 요소가 화면 밖으로 나가면 헤더가 흰 배경으로 바뀐다. */}
      <div ref={sentinelRef} className="kc-top-sentinel" aria-hidden="true" />
      <header className={`kc-head${isSolid ? ' is-solid' : ''}`}>
        <div className="kc-head-inner">
          <Link className="kc-logo" to="/" aria-label="홈으로">
            <span className="kc-logo-mark">{BRAND.name}</span>
            <span className="kc-logo-sub">{BRAND.sub}</span>
          </Link>

          <nav className="kc-nav">
            {NAV.map((n) =>
              n.children ? (
                // 상위 메뉴. 마우스를 올리거나(hover) 자식에 포커스가 가면(focus-within) 펼쳐진다.
                // 상위 자체는 이동 경로가 없어 button 이 아니라 그냥 표시용이다.
                <div className="kc-nav-group" key={n.label}>
                  <span className={`kc-nav-parent${isGroupActive(n, location.pathname) ? ' on' : ''}`}>
                    {n.label}
                    <span className="material-symbols-outlined">expand_more</span>
                  </span>
                  <div className="kc-nav-drop">
                    {/* end 를 준 이유 — NavLink 는 기본이 접두사 매칭이라 /company 가
                        /company/greeting·/company/org 에서도 활성으로 잡힌다.
                        그러면 하위 화면에 있어도 "회사소개"가 계속 눌린 것처럼 보인다. */}
                    {n.children.map((c) => (
                      <NavLink key={c.to} to={c.to} end className={({ isActive }) => (isActive ? 'on' : '')}>
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'on' : '')}>
                  {n.label}
                </NavLink>
              ),
            )}
          </nav>

          <button
            type="button"
            className="kc-burger"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* 항상 마운트해 두고 클래스로만 열고 닫는다 — 그래야 슬라이드가 걸린다. */}
      <div className={`kc-drawer-back${open ? ' open' : ''}`} onClick={() => setOpen(false)} />
      <nav className={`kc-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="kc-drawer-head">
          <span className="kc-logo-mark">{BRAND.name}</span>
          <button type="button" className="kc-drawer-x" aria-label="메뉴 닫기" onClick={() => setOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {NAV.map((n) =>
          n.children ? <DrawerGroup key={n.label} item={n} /> : (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'on' : '')}>
              {n.label}
            </NavLink>
          ),
        )}
        <Link className="kc-btn kc-btn-primary" to="/contact">
          문의하기
        </Link>
      </nav>
    </>
  )
}

/** 지금 보고 있는 화면이 이 묶음에 속하는가. 상위 메뉴를 활성 표시하는 데 쓴다. */
function isGroupActive(group, pathname) {
  return group.children.some((c) => pathname === c.to || pathname.startsWith(`${c.to}/`))
}

/** 드로어의 상위 메뉴. 눌러서 자식을 접었다 편다.
 *  지금 화면이 속한 묶음은 처음부터 펼쳐 둔다 — 어디 있는지 바로 보이게 하려는 것이다. */
function DrawerGroup({ item }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(() => isGroupActive(item, pathname))

  useEffect(() => {
    if (isGroupActive(item, pathname)) setOpen(true)
  }, [item, pathname])

  return (
    <div className="kc-drawer-group">
      <button
        type="button"
        className={`kc-drawer-parent${open ? ' open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <span className="material-symbols-outlined">expand_more</span>
      </button>
      {/* 안쪽 래퍼가 하나여야 grid-template-rows 0fr↔1fr 펼침이 동작한다.
          자식들을 이 div 없이 직접 두면 각각이 별도 행이 되어 접히지 않는다. */}
      <div className={`kc-drawer-children${open ? ' open' : ''}`}>
        <div>
          {/* 데스크톱 드롭다운과 같은 이유로 end 를 준다(접두사 매칭 방지). */}
          {item.children.map((c) => (
            <NavLink key={c.to} to={c.to} end className={({ isActive }) => (isActive ? 'on' : '')}>
              {c.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="kc-foot">
      <div className="kc-wrap">
        <div className="kc-foot-grid">
          <div>
            <h4>{BRAND.name}</h4>
            <p>
              {CONTACT.address}
              <br />
              TEL: {CONTACT.phone}
              <br />
              {CONTACT.email}
            </p>
          </div>
          <div>
            <h5>바로가기</h5>
            {/* 푸터는 계층 없이 평평하게 — 상위 메뉴는 이동할 곳이 없어 링크가 되지 못한다. */}
            <ul className="kc-foot-links">
              {NAV_FLAT.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>고객지원</h5>
            <ul className="kc-foot-links">
              <li>
                <a href={`mailto:${CONTACT.email}`}>이메일 문의</a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone.replace(/-/g, '')}`}>전화 문의</a>
              </li>
              {/* 관리자 콘솔. 호스팅에 /admin 경로가 이미 있어 /mng 를 쓴다. */}
              <li>
                <a href="/mng/login.html">관리자</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="kc-foot-bar">© {new Date().getFullYear()} {BRAND.name}. ALL RIGHTS RESERVED.</div>
      </div>
    </footer>
  )
}

/** 서브 페이지 상단 배너 + 빵부스러기. 네 화면이 같은 모양을 쓴다. */
export function SubHead({ title }) {
  return (
    <section className="kc-sub">
      <div className="kc-wrap">
        <ol className="kc-crumb">
          <li>
            <Link to="/">
              <span className="material-symbols-outlined">home</span>Home
            </Link>
          </li>
          <li>{title}</li>
        </ol>
        <h1>{title}</h1>
      </div>
    </section>
  )
}

/** 섹션 제목 묶음. 왼쪽 정렬이 기본이고, center 를 줄 때만 가운데로 간다. */
export function SecHead({ title, desc, center = false }) {
  return (
    <div className={`kc-sec-head${center ? ' center' : ''}`}>
      <h2 className="kc-sec-title">{title}</h2>
      {desc && <p className="kc-sec-desc">{desc}</p>}
    </div>
  )
}
