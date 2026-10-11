import { useState } from 'react'
import SiteShell, { SubHead, SecHead } from '../../components/company/SiteShell'
import { CONTACT } from '../../company-data'
import { signupApi } from '../../api/homeClient'

/**
 * 회원가입(/signup). exprism.co.kr 에서 손님이 직접 아이디·비밀번호를 정해 가입한다.
 * 승인이 필요 없다 — 가입하면 바로 쓸 수 있고, 가게코드와 로그인 링크를 안내한다.
 */
const OWNER_LOGIN = 'https://kanchenjunga.co.kr/admin/login'

export default function SignupPage() {
  const [form, setForm] = useState({ storeName: '', ownerName: '', loginId: '', password: '', password2: '', email: '', phone: '' })
  const [state, setState] = useState({ sending: false, error: '', done: null }) // done = { tenantCode, loginId }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    if (form.password !== form.password2) { setState((s) => ({ ...s, error: '비밀번호가 서로 다릅니다.' })); return }
    setState({ sending: true, error: '', done: null })
    try {
      const res = await signupApi.create({
        storeName: form.storeName.trim(),
        ownerName: form.ownerName.trim(),
        loginId: form.loginId.trim(),
        password: form.password,
        email: `${form.email}`.trim(),
        phone: form.phone.trim() || undefined,
      })
      setState({ sending: false, error: '', done: res })
    } catch (err) {
      setState({ sending: false, error: err.message || '가입에 실패했습니다. 입력을 확인해 주세요.', done: null })
    }
  }

  // 가입 완료 화면
  if (state.done) {
    const loginUrl = `${OWNER_LOGIN}/${state.done.tenantCode}`
    return (
      <SiteShell solidHeader title="가입 완료">
        <SubHead title="가입 완료" />
        <section className="kc-sec">
          <div className="kc-wrap">
            <div className="su-done">
              <span className="material-symbols-outlined su-done-ic">check_circle</span>
              <h2>가입이 완료되었습니다 🎉</h2>
              <p>바로 로그인해서 메뉴판을 만들 수 있어요. 아래 정보로 로그인하세요.</p>
              <dl className="su-done-info">
                <div><dt>가게코드</dt><dd className="su-code">{state.done.tenantCode}</dd></div>
                <div><dt>아이디</dt><dd>{state.done.loginId}</dd></div>
              </dl>
              <a className="kc-btn kc-btn-primary su-done-btn" href={loginUrl}>
                로그인하러 가기
                <span className="material-symbols-outlined">arrow_forward</span>
              </a>
              <p className="su-done-note">가게코드는 로그인과 손님 QR 주소에 쓰입니다. 잊지 않도록 저장해 두세요.</p>
            </div>
          </div>
        </section>
      </SiteShell>
    )
  }

  return (
    <SiteShell solidHeader title="회원가입">
      <SubHead title="회원가입" />
      <section className="kc-sec">
        <div className="kc-wrap">
          <SecHead
            title="무료로 시작하세요"
            desc="아이디와 비밀번호만 정하면 바로 가입됩니다. 승인 기다릴 필요 없이 다국어 QR 메뉴판을 만들 수 있어요."
          />

          <form className="kc-form su-form" onSubmit={onSubmit} noValidate={false}>
            <div className="kc-row">
              <label className="kc-field">
                <span>가게 이름<span className="kc-req">*</span></span>
                <input type="text" placeholder="맛있는식당" required value={form.storeName} onChange={set('storeName')} />
              </label>
              <label className="kc-field">
                <span>대표자 이름<span className="kc-req">*</span></span>
                <input type="text" placeholder="홍길동" required value={form.ownerName} onChange={set('ownerName')} />
              </label>
            </div>

            <div className="kc-row">
              <label className="kc-field">
                <span>아이디<span className="kc-req">*</span></span>
                <input type="text" placeholder="영문·숫자 4자 이상" required minLength={4} maxLength={50}
                  value={form.loginId} onChange={set('loginId')} autoComplete="username" />
              </label>
              <label className="kc-field">
                <span>이메일<span className="kc-req">*</span></span>
                <input type="email" placeholder="you@example.com" required value={form.email} onChange={set('email')} autoComplete="email" />
              </label>
            </div>

            <div className="kc-row">
              <label className="kc-field">
                <span>비밀번호<span className="kc-req">*</span></span>
                <input type="password" placeholder="6자 이상" required minLength={6}
                  value={form.password} onChange={set('password')} autoComplete="new-password" />
              </label>
              <label className="kc-field">
                <span>비밀번호 확인<span className="kc-req">*</span></span>
                <input type="password" placeholder="다시 입력" required minLength={6}
                  value={form.password2} onChange={set('password2')} autoComplete="new-password" />
              </label>
            </div>

            <label className="kc-field">
              <span>연락처 (선택)</span>
              <input type="tel" placeholder="010-1234-5678" value={form.phone} onChange={set('phone')} />
            </label>

            {state.error && <p className="su-error">{state.error}</p>}

            <button type="submit" className="kc-btn kc-btn-primary su-submit" disabled={state.sending}>
              {state.sending ? '가입 중…' : '가입하고 시작하기'}
            </button>
            <p className="su-help">이미 가입하셨나요? <a href={OWNER_LOGIN}>로그인</a> · 궁금한 점은 {CONTACT.phone}</p>
          </form>
        </div>
      </section>
    </SiteShell>
  )
}
