import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import TableOrderPage from './pages/TableOrderPage'
import StoreLandingPage from './pages/StoreLandingPage'
import HomePage from './pages/company/HomePage'
import ExprismPage from './pages/company/ExprismPage'
import AboutPage from './pages/company/AboutPage'
import GreetingPage from './pages/company/GreetingPage'
import OrgPage from './pages/company/OrgPage'
import ConsultingPage from './pages/company/ConsultingPage'
import DesignPage from './pages/company/DesignPage'
import NoticePage from './pages/company/NoticePage'
import ContactPage from './pages/company/ContactPage'
import { I18nProvider } from './i18n-context'

// 이 서버는 두 가지를 서빙한다.
//  1) KANCHENJUNGA 회사 사이트 — root(/) 와 고정 경로들
//  2) EXPRISM 손님 주문앱 — QR 로 들어오는 /{업체코드}/{테이블코드}. 로그인 없음.
//
// 회사 사이트 경로(/company 등)와 주문앱의 /:tenantCode 는 형태가 같다.
// react-router 는 고정 문자열을 동적 세그먼트보다 우선하므로 /company 가 먼저 잡힌다.
// 그래도 읽는 사람이 헷갈리지 않게 회사 경로를 위에 모아 둔다.
/**
 * 화면을 옮기면 맨 위에서 시작한다.
 * react-router 는 스크롤 위치를 그대로 두기 때문에, 긴 페이지 하단에서 메뉴를 누르면
 * 다음 화면이 중간부터 보인다. 그걸 막는다.
 *
 * company.css 에 scroll-behavior:smooth 가 걸려 있어서 그냥 scrollTo 하면
 * 새 화면이 위로 주르륵 올라가고, 이동 중 페이지 높이가 바뀌면 중간에 멈춰 버린다
 * (실제로 0 이 아니라 56 에서 멈췄다). behavior:'instant' 옵션만으로는 부족해서
 * CSS 값을 잠깐 auto 로 덮고 이동한 뒤 되돌린다.
 *
 * 같은 페이지 안의 앵커(#services)는 라우트가 바뀌지 않으므로 여기 걸리지 않는다 —
 * 그쪽은 계속 부드럽게 움직인다.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const root = document.documentElement
    const prev = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, 0)
    root.style.scrollBehavior = prev
  }, [pathname])
  return null
}


/** exprism.co.kr(및 www) 로 들어왔는가. 로컬·IP 접속에서는 false 라 회사 사이트가 뜬다. */
function isExprismHost() {
  if (typeof window === 'undefined') return false
  return /(^|\.)exprism\.co\.kr$/i.test(window.location.hostname)
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ScrollToTop />
        <Routes>
          {/* KANCHENJUNGA 회사 사이트 */}
          {/*
            첫 화면은 도메인에 따라 갈린다.
              exprism.co.kr  → EXPRISM 제품 소개
              그 외          → KANCHENJUNGA 회사 소개
            한 벌의 빌드로 두 도메인을 서빙하므로 서버가 아니라 여기서 나눈다.
            회사 사이트의 나머지 화면(/company, /notice …)은 두 도메인에서 모두 열린다.
          */}
          <Route path="/" element={isExprismHost() ? <ExprismPage /> : <HomePage />} />
          <Route path="/exprism" element={<ExprismPage />} />
          {/* 회사정보 묶음 — 상위(회사정보)는 이동할 곳이 없고 자식만 화면을 가진다. */}
          <Route path="/company" element={<AboutPage />} />
          <Route path="/company/greeting" element={<GreetingPage />} />
          <Route path="/company/org" element={<OrgPage />} />
          {/* '사업영역 소개'(/biz-area) 는 메뉴에서 뺐다. 화면 파일(BizAreaPage.jsx)은
              남겨 뒀지만 import 하지 않으므로 번들에는 들어가지 않는다 — 되살릴 때 여기에
              다시 연결하면 된다. */}
          <Route path="/biz-area/consulting" element={<ConsultingPage />} />
          <Route path="/design" element={<DesignPage />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* EXPRISM 손님 주문앱 — 포장 전용 QR 은 고정 경로라 테이블 경로보다 먼저 둔다. */}
          <Route path="/:tenantCode/takeout" element={<TableOrderPage mode="takeout" />} />
          <Route path="/:tenantCode/:tableCode" element={<TableOrderPage />} />
          {/* 가게 소개 랜딩 — 테이블 없이 업체코드만. 주문 X, 소개·메뉴 보기. */}
          <Route path="/:tenantCode" element={<StoreLandingPage />} />

          {/* 그 외 경로는 회사 사이트 root 로. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </I18nProvider>
    </BrowserRouter>
  )
}
