import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useI18n } from '../i18n-context'
import { openLauncher, pickLauncherUrl, copyText } from '../banks'
import { shopApi } from '../api/client'

// 서버(공통코드) 목록을 못 받을 때의 최소 폴백 — 토스 송금만이라도 동작하게.
const FALLBACK = [{ code: 'toss', name: '토스', url: 'supertoss://send?bank={bank}&accountNo={accountNo}', androidUrl: '' }]

/**
 * 송금 실행 바 — 콤보박스로 은행을 고르고 "송금하기"를 누른다. 시트 하단에 고정돼 항상 보인다.
 *
 * 은행 목록은 서버 공통코드(BANK_LAUNCHER_URL ⋈ BANK_CD)에서 받는다. 콘솔에서 코드만 바꾸면
 * 은행이 늘고 URL이 바뀐다(프론트 재배포 불필요). 선택한 은행의 URL을 계좌 값으로 채워 연다.
 *
 * account 가 없으면 아무것도 그리지 않는다.
 */
export default function BankSendBar({ account, amount, onCopied }) {
  const { L } = useI18n()
  const [banks, setBanks] = useState(FALLBACK)
  const [selected, setSelected] = useState(FALLBACK[0].code)
  const [notice, setNotice] = useState('') // 앱 미설치 안내

  useEffect(() => {
    let alive = true
    shopApi.bankLaunchers()
      .then((list) => {
        if (!alive || !Array.isArray(list) || list.length === 0) return
        setBanks(list)
        setSelected(list[0].code)
      })
      .catch(() => { /* 실패 시 폴백(토스) 유지 */ })
    return () => { alive = false }
  }, [])

  if (!account?.accountNo) return null

  async function handleSend() {
    const bank = banks.find((b) => b.code === selected) || banks[0]
    if (!bank) return
    setNotice('')
    // 송금 버튼을 누르면 항상 계좌번호를 복사한다(앱에서 붙여넣기 대비).
    await copyText((account.accountNo || '').replace(/\s/g, ''))
    onCopied?.(L('bankCopiedOpen'))
    // 앱이 안 열리면(미설치) 안내 멘트를 띄운다.
    openLauncher(pickLauncherUrl(bank), account, amount, () => {
      setNotice(L('bankNotInstalled').replace('{bank}', bank.name))
    })
  }

  return (
    <div className="bank-send">
      <div className="bank-send-note">{L('bankSendCopyNote')}</div>
      <div className="bank-send-row">
        <select className="bank-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>{b.name}</option>
          ))}
        </select>
        <button type="button" className="bank-send-btn" onClick={handleSend}>
          <Icon name="send" />
          <span>{L('bankSend')}</span>
        </button>
      </div>
      {notice && <div className="bank-send-notice">{notice}</div>}
    </div>
  )
}
