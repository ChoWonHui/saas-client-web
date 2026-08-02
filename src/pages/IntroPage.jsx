/**
 * EXPRISM 회사 소개 페이지 — 손님 서버 root(/).
 * 테이블 QR 이 아닌 접속(운영중이 아닌 가게·잘못된 경로 포함)은 모두 여기로 온다.
 * 지금은 간략 버전. (추후 캡처 기준으로 정식 디자인 반영 예정)
 */
export default function IntroPage() {
  return (
    <div className="intro">
      <div className="intro-inner">
        <div className="intro-mark">EXPRISM</div>
        <p className="intro-slogan">We express your vision through innovation.</p>
        <p className="intro-desc">
          매장을 위한 스마트 주문·운영 플랫폼.<br />
          QR 테이블 주문부터 메뉴 관리, 매출 통계까지 한 곳에서.
        </p>
        <div className="intro-foot">© EXPRISM</div>
      </div>
    </div>
  )
}
