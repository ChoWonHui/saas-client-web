import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import TableOrderPage from './pages/TableOrderPage'
import StoreLandingPage from './pages/StoreLandingPage'
import ExprismPage from './pages/company/ExprismPage'
import { I18nProvider } from './i18n-context'

// 이 프로젝트는 EXPRISM 제품 사이트(exprism.co.kr) 전용이다.
//   /                     EXPRISM 제품 소개(ExprismPage)
//   /{업체코드}/{테이블}   손님 주문앱 (QR 진입, 로그인 없음)
// KANCHENJUNGA 회사 사이트(kanchenjunga.co.kr)는 saas-company-web 이 맡는다.
/**
 * 화면을 옮기면 맨 위에서 시작한다.
 * react-router 는 스크롤 위치를 그대로 두기 때문에, 긴 페이지 하단에서 메뉴를 누르면
 * 다음 화면이 중간부터 보인다. 그걸 막는다.
 * company.css 에 scroll-behavior:smooth 가 걸려 있어 CSS 값을 잠깐 auto 로 덮고 이동한 뒤 되돌린다.
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

/** exprism.co.kr(및 www) 로 들어왔는가. 로컬·IP 접속에서는 false. */
function isExprismHost() {
  if (typeof window === 'undefined') return false
  return /(^|\.)exprism\.co\.kr$/i.test(window.location.hostname)
}

export default function App() {
  // 주문앱(가게코드 경로)은 운영에서 EXPRISM 도메인일 때만 연다.
  // 엉뚱한 도메인/IP 로 이 빌드가 노출돼도 주문 화면이 뜨지 않게 한다.
  // 로컬 개발(npm run dev)에서는 호스트가 localhost 라 항상 열리게 해 테스트를 막지 않는다.
  const orderApp = isExprismHost() || import.meta.env.DEV
  return (
    <BrowserRouter>
      <I18nProvider>
        <ScrollToTop />
        <Routes>
          {/* EXPRISM 제품 소개 — 루트. /exprism 도 같은 화면(구 링크 호환). */}
          <Route path="/" element={<ExprismPage />} />
          <Route path="/exprism" element={<ExprismPage />} />

          {/* 손님 주문앱 — 포장·택배 전용 경로는 고정 문자열이라 테이블 경로보다 먼저 둔다. */}
          <Route path="/:tenantCode/takeout" element={orderApp ? <TableOrderPage mode="takeout" /> : <Navigate to="/" replace />} />
          {/* 택배 주문(비로그인). 가게가 택배 ON 일 때만 접수되고, 결제 시 배송지를 입력한다. */}
          <Route path="/:tenantCode/parcel" element={orderApp ? <TableOrderPage mode="parcel" /> : <Navigate to="/" replace />} />
          <Route path="/:tenantCode/:tableCode" element={orderApp ? <TableOrderPage /> : <Navigate to="/" replace />} />
          {/* 가게 소개 랜딩 — 테이블 없이 업체코드만. 주문 X, 소개·메뉴 보기. */}
          <Route path="/:tenantCode" element={orderApp ? <StoreLandingPage /> : <Navigate to="/" replace />} />

          {/* 그 외 경로(회사 사이트 경로 포함)는 제품 소개로. 회사 화면은 kanchenjunga.co.kr 로 nginx 가 넘긴다. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </I18nProvider>
    </BrowserRouter>
  )
}
