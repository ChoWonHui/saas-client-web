import { Link } from 'react-router-dom'
import SiteShell, { SecHead, BRAND_LOGO } from '../../components/company/SiteShell'
import { BRAND, EXPRISM } from '../../company-data'

/**
 * EXPRISM 제품 소개.
 *
 * exprism.co.kr 의 첫 화면이다(App.jsx 의 호스트 분기 참조).
 * KANCHENJUNGA 회사 사이트와 같은 껍데기(SiteShell)와 디자인 체계를 쓴다.
 *
 * 화면 사진은 실제 운영 중인 주문앱을 캡쳐한 것이다(public/exprism/*.jpg).
 * 그림을 지어내지 않고 실물을 보여준다.
 */
export default function ExprismPage() {
  return (
    <SiteShell title="EXPRISM">
      <Hero />
      <Guest />
      <Owner />
      <Languages />
      <Maker />
      <Closing />
      <Dock />
    </SiteShell>
  )
}

/*
 * 좁은 화면에서만 보이는 하단 고정 버튼.
 * 화면이 길어서 아래로 내려가면 문의로 가는 길이 사라진다. 전화번호는 이 도메인에서
 * 쓰지 않기로 했으므로 버튼은 하나다.
 */
function Dock() {
  return (
    <div className="ex-dock">
      <Link className="kc-btn kc-btn-primary" to="/contact">
        도입 문의하기
        <span className="material-symbols-outlined">arrow_forward</span>
      </Link>
    </div>
  )
}

/* 좌우 분할. 왼쪽 글, 오른쪽 실제 주문 화면. */
function Hero() {
  return (
    <section className="kc-hero ex-hero">
      {/* 짙은 히어로 오른쪽 위에 로고를 크게, 아주 옅게 깔아 둔다.
          제목과 겹치지 않는 자리라 읽는 데 방해가 없고, 첫 화면에 제품의 얼굴이 남는다. */}
      <img className="ex-hero-watermark" src={BRAND_LOGO.icon} alt="" width="384" height="406" aria-hidden="true" />

      <div className="kc-hero-inner">
        <p className="ex-mark">
          <img src={BRAND_LOGO.icon} alt="" width="384" height="406" />
          {BRAND.name} 자사 솔루션
        </p>
        <h1>
          테이블에 앉은 채로
          <br />
          주문이 끝납니다
        </h1>
        <p className="kc-hero-lead">{EXPRISM.lead}</p>
        <div className="kc-hero-actions">
          <Link className="kc-btn kc-btn-primary" to="/contact">
            도입 문의
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <a className="kc-btn kc-btn-ghost" href="#guest">
            화면 보기
          </a>
        </div>
      </div>

      {/*
        왼쪽은 실제로 돌아가는 가게 화면을 그대로 띄운다(같은 사이트라 프레임에 담긴다).
        오른쪽은 사용 영상. 둘 다 폰 크기(300x554)로 맞춘다.

        iframe 은 무겁다. loading="lazy" 를 쓰면 히어로가 비어 보이므로
        가게 화면만 즉시 불러오고 영상은 늦게 불러온다.
      */}
      <div className="ex-hero-shot">
        <iframe
          className="ex-hero-frame"
          src="/M95YCUSTCP"
          title="EXPRISM 으로 만든 가게 화면 예시"
          width="300"
          height="554"
        />
        <iframe
          className="ex-hero-frame"
          src="https://www.youtube.com/embed/qW4AT9z3D08?autoplay=1&mute=1&loop=1&playlist=qW4AT9z3D08&controls=0&playsinline=1&rel=0"
          title="EXPRISM 사용 영상"
          width="300"
          height="554"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </section>
  )
}

/* 손님 화면. 사진을 나란히 놓고 아래에 설명을 붙인다. */
function Guest() {
  return (
    <section className="kc-sec" id="guest">
      <div className="kc-wrap">
        <SecHead
          title="손님은 앱을 깔지 않습니다"
          desc="테이블의 QR 을 찍으면 바로 메뉴가 열립니다. 회원가입도, 로그인도 없습니다."
        />
        <ul className="ex-shots">
          {EXPRISM.guest.map((g, i) => (
            <li key={g.img}>
              <div className="ex-shot">
                <img src={g.img} alt={g.alt} width="640" height="1385" loading="lazy" decoding="async" />
              </div>
              <h3><span className="ex-shot-no">{String(i + 1).padStart(2, '0')}</span>{g.title}</h3>
              <p>{g.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/*
 * 사장님 화면. 콘솔도 휴대폰에서 쓰므로 손님 화면과 같은 세로 캡쳐다.
 * 네 장이라 4단으로 놓고, 화면으로 보여주지 않는 기능은 아래 가로선 목록으로 넘긴다.
 */
function Owner() {
  return (
    <section className="kc-sec kc-sec-alt" id="owner">
      <div className="kc-wrap">
        <SecHead
          title="사장님은 한 화면에서 봅니다"
          desc="가게에서 쓰는 그대로입니다. 휴대폰만 있으면 자리에서 확인하고 바꿉니다."
        />

        <ul className="ex-shots ex-shots-4">
          {EXPRISM.ownerShots.map((o) => (
            <li key={o.img}>
              <div className="ex-shot">
                <img src={o.img} alt={o.alt} width="640" height="1090" loading="lazy" decoding="async" />
              </div>
              <h3>{o.title}</h3>
              <p>{o.desc}</p>
            </li>
          ))}
        </ul>

        <ul className="ex-feat">
          {EXPRISM.ownerMore.map((f, i) => (
            <li key={f.title}>
              <span className="ex-feat-no">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* 언어. 앞뒤 섹션과 겹치지 않게 넓은 띠 하나로 처리한다. */
function Languages() {
  return (
    <section className="ex-lang">
      <div className="kc-wrap ex-lang-inner">
        <div>
          <h2>메뉴판이 손님의 언어로 열립니다</h2>
          <p>
            한국어로 한 번만 등록하면 영어, 일본어, 중국어, 스페인어로 자동 번역됩니다. 손님이 화면 위에서 언어를
            고르면 메뉴 이름과 설명이 그대로 바뀝니다.
          </p>
          <ul className="ex-lang-list">
            {EXPRISM.languages.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="ex-shot ex-lang-shot">
          <img
            src="/exprism/lang.jpg"
            alt="주문 화면에서 언어를 고르는 목록. 한국어, English, 日本語, 中文, Español 이 보인다."
            width="640"
            height="1385"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}

/*
 * 만든 회사. 제품 사이트에 들어온 사람은 "이걸 누가 만들고 누가 책임지나" 를 묻는다.
 * 외식 솔루션 하나만 파는 회사가 아니라 IT 서비스 회사가 만든 제품임을 밝힌다.
 */
function Maker() {
  return (
    <section className="kc-sec" id="maker">
      <div className="kc-wrap ex-maker">
        <div>
          <p className="ex-mark ex-mark-dark">MADE BY</p>
          <img className="ex-maker-logo" src={BRAND_LOGO.wordmark} alt="EXPRISM" width="556" height="96" loading="lazy" />
          <h2>{BRAND.name} 가 만들고 운영합니다</h2>
          <p className="ex-maker-desc">
            {BRAND.name} 는 홈페이지 제작부터 이미 쓰고 계신 시스템의 유지보수까지 맡는 IT 서비스 회사입니다.
            EXPRISM 은 그중 저희가 직접 만들어 운영하는 자사 솔루션입니다. 외주로 받아 넘긴 제품이 아니라,
            만든 사람이 계속 고치고 이어갑니다.
          </p>
          <a className="kc-btn kc-btn-line" href="https://kanchenjunga.co.kr/">
            회사 소개 보기
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
        <ul className="ex-maker-list">
          <li><strong>홈페이지 제작</strong><span>기획·디자인·개발을 한 팀이 이어서</span></li>
          <li><strong>시스템 유지보수</strong><span>이미 쓰고 계신 것을 넘겨받아</span></li>
          <li><strong>IT 컨설팅</strong><span>무엇부터 손댈지 정리부터</span></li>
        </ul>
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="kc-cta">
      <div className="kc-cta-inner">
        <h2>가게에 맞는지 먼저 확인해 보세요</h2>
        <p>
          매장 규모와 메뉴 구성을 알려주시면 어떻게 쓰이는지 함께 살펴보고 안내드립니다.
        </p>
        <Link className="kc-btn kc-btn-ghost" to="/contact">
          문의하기
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </section>
  )
}
