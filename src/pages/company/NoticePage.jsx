import { Link } from 'react-router-dom'
import SiteShell, { SubHead, SecHead } from '../../components/company/SiteShell'
import { BRAND, NOTICES } from '../../company-data'

/**
 * 공지사항(/notice). 원본 kanchenjunga-nodejs/public/notice.html 을 옮긴 것이다.
 *
 * 지금은 company-data.js 의 고정 목록을 보여준다. 게시판 API 가 붙으면
 * 그 배열 대신 목록을 받아 오면 되고, 이 화면의 구조는 그대로 쓸 수 있다.
 */
export default function NoticePage() {
  return (
    <SiteShell solidHeader title="공지사항">
      <SubHead title="공지사항" />

      <section className="kc-sec" id="notice-list">
        <div className="kc-wrap">
          <SecHead title={`${BRAND.name} 소식`} desc="새로운 서비스와 안내 사항을 전해드립니다." />

          {NOTICES.length === 0 ? (
            <p className="kc-sec-desc" style={{ textAlign: 'center' }}>
              등록된 공지사항이 없습니다.
            </p>
          ) : (
            <ul className="kc-notice">
              {NOTICES.map((n) => (
                <li className="kc-notice-item" key={n.id}>
                  <div className="kc-notice-top">
                    <span className="kc-tag">{n.tag}</span>
                    <h3>{n.title}</h3>
                  </div>
                  <p>{n.summary}</p>
                  <div className="kc-notice-meta">
                    <span>
                      <span className="material-symbols-outlined">calendar_today</span>
                      {n.date}
                    </span>
                    <span>
                      <span className="material-symbols-outlined">visibility</span>
                      조회수 {n.views.toLocaleString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="kc-cta">
        <div className="kc-cta-inner">
          <h2>더 궁금한 점이 있으신가요?</h2>
          <p>공지에서 다루지 않은 내용도 편하게 물어보세요. 담당자가 확인 후 답변드립니다.</p>
          <Link className="kc-btn kc-btn-primary" to="/contact">
            문의하기
            <span className="material-symbols-outlined">send</span>
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}
