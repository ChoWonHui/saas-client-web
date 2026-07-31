import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TableOrderPage from './pages/TableOrderPage'
import StoreLandingPage from './pages/StoreLandingPage'
import { I18nProvider } from './i18n-context'

// 손님은 QR 로 /{업체코드}/{테이블코드} 로 들어온다. 로그인 없음.
export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
      <Routes>
        {/* 포장 전용 QR — 고정 경로. 테이블 경로보다 먼저 둔다. */}
        <Route path="/:tenantCode/takeout" element={<TableOrderPage mode="takeout" />} />
        <Route path="/:tenantCode/:tableCode" element={<TableOrderPage />} />
        {/* 가게 소개 랜딩 — 테이블 없이 업체코드만. 주문 X, 소개·메뉴 보기. */}
        <Route path="/:tenantCode" element={<StoreLandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <div className="screen">
              <div className="screen-inner">
                <span className="material-symbols-outlined">qr_code_scanner</span>
                <h2>테이블 QR을 스캔해 주세요</h2>
                <p>각 테이블의 QR 코드를 스캔하면 메뉴판이 열립니다.</p>
              </div>
            </div>
          }
        />
      </Routes>
      </I18nProvider>
    </BrowserRouter>
  )
}
