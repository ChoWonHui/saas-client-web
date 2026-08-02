import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TableOrderPage from './pages/TableOrderPage'
import StoreLandingPage from './pages/StoreLandingPage'
import IntroPage from './pages/IntroPage'
import { I18nProvider } from './i18n-context'

// 손님은 QR 로 /{업체코드}/{테이블코드} 로 들어온다. 로그인 없음.
// root(/) 는 EXPRISM 회사 소개 페이지 — 운영중이 아닌 가게·잘못된 경로는 전부 여기로 온다.
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
      <Routes>
        {/* EXPRISM 회사 소개 — 손님 서버 root */}
        <Route path="/" element={<IntroPage />} />
        {/* 포장 전용 QR — 고정 경로. 테이블 경로보다 먼저 둔다. */}
        <Route path="/:tenantCode/takeout" element={<TableOrderPage mode="takeout" />} />
        <Route path="/:tenantCode/:tableCode" element={<TableOrderPage />} />
        {/* 가게 소개 랜딩 — 테이블 없이 업체코드만. 주문 X, 소개·메뉴 보기. */}
        <Route path="/:tenantCode" element={<StoreLandingPage />} />
        {/* 그 외 경로는 회사 소개(root)로. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </I18nProvider>
    </BrowserRouter>
  )
}
