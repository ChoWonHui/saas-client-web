// 손님 화면 다국어. UI 문구는 여기 정적 사전으로, 메뉴 콘텐츠(이름·설명)는
// 백엔드 자동 번역(i18nApi.translate)으로 처리한다. 기본 언어는 한국어.

export const DEFAULT_LANG = 'ko'

// 지원 언어 — code 는 백엔드 targetLang 과 동일하게 맞춘다(en/ja/zh/es).
export const LANGS = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

const LANG_CODES = LANGS.map((l) => l.code)
const STORAGE_KEY = 'client-lang'

export function getLang() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && LANG_CODES.includes(v)) return v
  } catch { /* localStorage 접근 불가(사생활 모드 등) */ }
  return DEFAULT_LANG
}

export function setLang(code) {
  try { localStorage.setItem(STORAGE_KEY, code) } catch { /* 무시 */ }
}

export function langMeta(code) {
  return LANGS.find((l) => l.code === code) || LANGS[0]
}

// UI 문구 사전. key → { ko, en, ja, zh, es }
const UI = {
  home:          { ko: '가게 홈',   en: 'Home',        ja: 'ホーム',       zh: '店铺主页',   es: 'Inicio' },
  menuTab:       { ko: '메뉴판 보기', en: 'View menu',  ja: 'メニュー',     zh: '查看菜单',   es: 'Ver menú' },
  soldOut:       { ko: '품절',       en: 'Sold out',    ja: '品切れ',       zh: '售罄',       es: 'Agotado' },
  video:         { ko: '영상',       en: 'Video',       ja: '動画',         zh: '视频',       es: 'Video' },
  emptyMenu:     { ko: '아직 등록된 메뉴가 없어요.', en: 'No menu items yet.', ja: 'まだ登録されたメニューがありません。', zh: '暂无菜单。', es: 'Aún no hay menú.' },
  tapForSound:   { ko: '탭하여 소리', en: 'Tap for sound', ja: 'タップで音声', zh: '点击开启声音', es: 'Toca para sonido' },
  loading:       { ko: '가게 정보를 불러오는 중…', en: 'Loading store…', ja: '店舗情報を読み込み中…', zh: '正在加载店铺信息…', es: 'Cargando tienda…' },
  notFound:      { ko: '가게를 찾을 수 없어요', en: 'Store not found', ja: '店舗が見つかりません', zh: '找不到店铺', es: 'Tienda no encontrada' },
  storeInfo:     { ko: '가게 소개',   en: 'About',       ja: '店舗紹介',     zh: '店铺介绍',   es: 'Acerca de' },
  more:          { ko: '더보기',      en: 'More',        ja: 'もっと見る',   zh: '更多',       es: 'Más' },
  introPreparing:{ ko: '가게 소개글을 준비중입니다.', en: 'Store introduction coming soon.', ja: '店舗紹介を準備中です。', zh: '店铺介绍准备中。', es: 'Presentación en preparación.' },
  translating:   { ko: '번역 중…',   en: 'Translating…', ja: '翻訳中…',     zh: '翻译中…',    es: 'Traduciendo…' },
  language:      { ko: '언어',        en: 'Language',    ja: '言語',         zh: '语言',       es: 'Idioma' },

  // ── 주문 화면(TableOrderPage) ──
  loadingMenu:   { ko: '메뉴판을 불러오는 중…', en: 'Loading menu…', ja: 'メニューを読み込み中…', zh: '正在加载菜单…', es: 'Cargando menú…' },
  menuOpenFail:  { ko: '메뉴판을 열 수 없어요', en: 'Cannot open the menu', ja: 'メニューを開けません', zh: '无法打开菜单', es: 'No se puede abrir el menú' },
  menuOpenFailSub:{ ko: 'QR 코드를 다시 스캔하거나 직원에게 문의해 주세요.', en: 'Please rescan the QR code or ask a staff member.', ja: 'QRコードを再スキャンするか、スタッフにお尋ねください。', zh: '请重新扫描二维码或询问店员。', es: 'Vuelva a escanear el código QR o pregunte al personal.' },
  takeoutStopTitle:{ ko: '현재 포장 주문이 정지되었어요', en: 'Takeout orders are paused', ja: '現在テイクアウト注文は停止中です', zh: '当前暂停外带订单', es: 'Los pedidos para llevar están pausados' },
  takeoutStopSub:{ ko: '지금은 포장 주문을 받지 않습니다. 매장에 문의하거나 잠시 후 다시 시도해 주세요.', en: 'Takeout is not available now. Please ask the store or try again later.', ja: '現在テイクアウトを受け付けていません。店舗にお問い合わせいただくか、しばらくしてからお試しください。', zh: '目前不接受外带订单。请咨询门店或稍后再试。', es: 'Ahora no se aceptan pedidos para llevar. Consulte en la tienda o inténtelo más tarde.' },
  // 메뉴판 전용(FREE 요금제) — 주문 기능 없이 메뉴만 보여준다.
  // 좁은 화면에서 한 줄로 흐르면 읽기 나쁘다. 두 문장을 나눠 두고 화면에서 줄을 바꾼다.
  menuOnlyBar:   { ko: '메뉴판만 보실 수 있어요.', en: 'Menu only.', ja: 'メニューのみご覧いただけます。', zh: '仅供浏览菜单。', es: 'Solo carta.' },
  menuOnlyBar2:  { ko: '주문은 직원에게 말씀해 주세요.', en: 'Please order with a staff member.', ja: 'ご注文はスタッフにお申し付けください。', zh: '点单请告知店员。', es: 'Haga su pedido con el personal.' },
  menuOnlyClose: { ko: '닫기',        en: 'Close',       ja: '閉じる',       zh: '关闭',       es: 'Cerrar' },
  // 입금 계좌 안내(메뉴 상세 시트).
  bankTitle:     { ko: '입금계좌',    en: 'Account',     ja: '振込口座',     zh: '汇款账户',   es: 'Cuenta' },
  bankShow:      { ko: '보기',        en: 'Show',        ja: '表示',         zh: '查看',       es: 'Ver' },
  bankHide:      { ko: '숨기기',      en: 'Hide',        ja: '非表示',       zh: '隐藏',       es: 'Ocultar' },
  bankHolder:    { ko: '예금주',      en: 'Account holder', ja: '口座名義',   zh: '开户名',     es: 'Titular' },
  bankCopy:      { ko: '복사',        en: 'Copy',        ja: 'コピー',       zh: '复制',       es: 'Copiar' },
  bankCopied:    { ko: '계좌번호를 복사했어요', en: 'Account number copied', ja: '口座番号をコピーしました', zh: '已复制账号', es: 'Numero de cuenta copiado' },
  bankPickApp:   { ko: '송금할 앱을 선택하세요', en: 'Choose an app to send money', ja: '送金するアプリを選択', zh: '选择转账App', es: 'Elige una app para enviar' },
  bankSend:      { ko: '송금하기',    en: 'Send',        ja: '送金',         zh: '转账',       es: 'Enviar' },
  bankNotInstalled: { ko: '{bank} 앱이 설치되어 있지 않아요', en: '{bank} app is not installed', ja: '{bank} アプリがインストールされていません', zh: '未安装{bank}App', es: 'La app {bank} no está instalada' },
  bankSendCopyNote: { ko: '송금 버튼을 누르면 계좌번호가 자동 복사돼요', en: 'Tapping Send copies the account number automatically', ja: '送金を押すと口座番号が自動コピーされます', zh: '点击转账会自动复制账号', es: 'Al pulsar Enviar se copia la cuenta' },
  bankRecommend: { ko: '추천',        en: 'Best',        ja: 'おすすめ',     zh: '推荐',       es: 'Rec.' },
  bankPickHint:  { ko: '토스는 계좌·금액이 자동 입력돼요. 토스가 없으면 사용하는 은행을 선택하세요.', en: 'Toss prefills the account and amount. No Toss? Pick your bank.', ja: 'Tossは口座・金額が自動入力されます。Tossがなければ銀行を選択。', zh: 'Toss会自动填入账号和金额。没有Toss请选择银行。', es: 'Toss rellena cuenta e importe. ¿Sin Toss? Elige tu banco.' },
  bankCopiedOpen:{ ko: '계좌번호 복사됨 · 은행 앱에서 붙여넣기 하세요', en: 'Account copied · paste it in your bank app', ja: '口座番号コピー済み · 銀行アプリで貼り付け', zh: '账号已复制 · 请在银行App粘贴', es: 'Cuenta copiada · pega en tu app bancaria' },
  payDone:       { ko: '결제가 완료되었어요', en: 'Payment complete', ja: 'お支払いが完了しました', zh: '支付完成', es: 'Pago completado' },
  payDoneSub:    { ko: '주문이 접수되어 곧 조리를 시작합니다.', en: 'Your order is received and cooking will begin soon.', ja: 'ご注文を受け付けました。まもなく調理を始めます。', zh: '订单已接收，即将开始烹饪。', es: 'Tu pedido fue recibido y pronto comenzará a prepararse.' },
  payDoneTakeout:{ ko: '포장으로 준비되면 알려드릴게요.', en: "We'll let you know when your takeout is ready.", ja: 'テイクアウトの準備ができたらお知らせします。', zh: '外带准备好后会通知您。', es: 'Te avisaremos cuando tu pedido para llevar esté listo.' },
  payDoneTable:  { ko: '자리로 가져다 드릴게요.', en: "We'll bring it to your table.", ja: 'お席までお持ちします。', zh: '我们会送到您的座位。', es: 'Lo llevaremos a tu mesa.' },
  orderNo:       { ko: '주문번호',    en: 'Order no.',   ja: '注文番号',     zh: '订单号',     es: 'N.º de pedido' },
  seeMoreMenu:   { ko: '메뉴 더 보기', en: 'See more menu', ja: 'メニューをもっと見る', zh: '查看更多菜单', es: 'Ver más menú' },
  seeMyOrders:   { ko: '내 주문 내역 보기', en: 'View my orders', ja: '注文履歴を見る', zh: '查看我的订单', es: 'Ver mis pedidos' },
  myOrders:      { ko: '내 주문',     en: 'My orders',   ja: '注文',         zh: '我的订单',   es: 'Mis pedidos' },
  infoView:      { ko: '정보 보기',   en: 'View info',   ja: '情報を見る',   zh: '查看信息',   es: 'Ver info' },
  viewCart:      { ko: '장바구니 보기', en: 'View cart',  ja: 'カートを見る', zh: '查看购物车', es: 'Ver carrito' },
  added:         { ko: '담았어요',    en: 'added',       ja: 'を追加しました', zh: '已加入',    es: 'añadido' },
  takeoutLabel:  { ko: '포장 주문',   en: 'Takeout',     ja: 'テイクアウト', zh: '外带',       es: 'Para llevar' },

  // ── 옵션 시트(OptionSheet) ──
  required:      { ko: '필수',        en: 'Required',    ja: '必須',         zh: '必选',       es: 'Obligatorio' },
  optionExtra:   { ko: '옵션',        en: 'Options',     ja: 'オプション',   zh: '选项',       es: 'Opciones' },
  addToCart:     { ko: '담기',        en: 'Add',         ja: '追加',         zh: '加入',       es: 'Añadir' },
  selectSuffix:  { ko: '선택',        en: 'Select',      ja: 'を選択',       zh: '选择',       es: 'Seleccionar' },

  // ── 장바구니 시트(CartSheet) ──
  cart:          { ko: '장바구니',    en: 'Cart',        ja: 'カート',       zh: '购物车',     es: 'Carrito' },
  payMethod:     { ko: '결제 수단',   en: 'Payment method', ja: '支払い方法', zh: '支付方式',   es: 'Método de pago' },
  memoPlaceholder:{ ko: '요청사항 (예: 덜 맵게 해주세요)', en: 'Requests (e.g. less spicy)', ja: 'ご要望（例：辛さ控えめ）', zh: '备注（例：不要太辣）', es: 'Peticiones (ej.: menos picante)' },
  memoPlaceholderParcel:{ ko: '배송 요청사항 (예: 부재 시 문 앞에 놓아주세요)', en: 'Delivery request (e.g. leave at the door)', ja: '配送のご要望（例：不在時はドア前に）', zh: '配送备注（例：不在家请放门口）', es: 'Petición de envío (ej.: dejar en la puerta)' },
  totalPay:      { ko: '총 결제금액', en: 'Total',       ja: '合計金額',     zh: '合计金额',   es: 'Total a pagar' },
  paying:        { ko: '결제 처리 중…', en: 'Processing…', ja: '決済処理中…', zh: '支付处理中…', es: 'Procesando…' },
  payNow:        { ko: '결제하기',    en: 'Pay',         ja: '支払う',       zh: '去支付',     es: 'Pagar' },
  payFail:       { ko: '결제에 실패했어요. 다시 시도해 주세요.', en: 'Payment failed. Please try again.', ja: '決済に失敗しました。もう一度お試しください。', zh: '支付失败，请重试。', es: 'El pago falló. Inténtalo de nuevo.' },
  payTransfer:   { ko: '계좌이체',    en: 'Bank transfer', ja: '口座振込',   zh: '银行转账',   es: 'Transferencia' },
  // ── 택배(배송지) ──
  parcelLabel:   { ko: '택배 주문',   en: 'Parcel order', ja: '宅配注文',    zh: '快递订单',   es: 'Pedido por paquetería' },
  parcelStopTitle:{ ko: '택배 주문을 받지 않아요', en: 'Parcel orders are not available', ja: '宅配注文は受け付けていません', zh: '暂不接受快递订单', es: 'No se aceptan pedidos por paquetería' },
  parcelStopSub: { ko: '이 가게는 현재 택배 주문을 받지 않습니다.', en: 'This store is not accepting parcel orders right now.', ja: 'この店舗は現在、宅配注文を受け付けていません。', zh: '本店目前不接受快递订单。', es: 'Esta tienda no acepta pedidos por paquetería ahora.' },
  payDoneParcel: { ko: '입력하신 주소로 택배 발송됩니다.', en: 'It will be shipped to your address.', ja: 'ご入力の住所へ宅配で発送されます。', zh: '将通过快递寄送至您填写的地址。', es: 'Se enviará por paquetería a su dirección.' },
  shipTitle:     { ko: '배송지',      en: 'Shipping address', ja: '配送先',    zh: '收货地址',   es: 'Dirección de envío' },
  shipRecipient: { ko: '수령인',      en: 'Recipient',   ja: '受取人',       zh: '收货人',     es: 'Destinatario' },
  shipPhone:     { ko: '연락처',      en: 'Phone',       ja: '連絡先',       zh: '联系电话',   es: 'Teléfono' },
  shipPostal:    { ko: '우편번호',    en: 'Postal code', ja: '郵便番号',     zh: '邮编',       es: 'Código postal' },
  shipSearch:    { ko: '주소 검색',   en: 'Find address', ja: '住所検索',    zh: '搜索地址',   es: 'Buscar dirección' },
  shipAddr:      { ko: '주소 (검색으로 입력)', en: 'Address (use search)', ja: '住所（検索で入力）', zh: '地址（用搜索填写）', es: 'Dirección (usa búsqueda)' },
  shipAddrDetail:{ ko: '상세주소(선택)', en: 'Detail (optional)', ja: '詳細住所(任意)', zh: '详细地址（选填）', es: 'Detalle (opcional)' },
  shipNeed:      { ko: '배송지를 입력하세요', en: 'Enter shipping address', ja: '配送先を入力してください', zh: '请填写收货地址', es: 'Introduce la dirección de envío' },
  payCard:       { ko: '신용·체크카드', en: 'Credit/Debit card', ja: 'クレジット・デビットカード', zh: '信用卡/借记卡', es: 'Tarjeta' },
  payKakao:      { ko: '카카오페이',  en: 'KakaoPay',    ja: 'カカオペイ',   zh: 'KakaoPay',   es: 'KakaoPay' },
  payToss:       { ko: '토스페이',    en: 'TossPay',     ja: 'トスペイ',     zh: 'TossPay',    es: 'TossPay' },

  // ── 내 주문 내역 시트(MyOrdersSheet) ──
  myOrdersTitle: { ko: '내 주문 내역', en: 'My orders',  ja: '注文履歴',     zh: '我的订单',   es: 'Mis pedidos' },
  noOrders:      { ko: '아직 주문 내역이 없어요.', en: 'No orders yet.', ja: 'まだ注文履歴がありません。', zh: '暂无订单。', es: 'Aún no hay pedidos.' },
  orderTotal:    { ko: '주문 합계',   en: 'Order total', ja: '注文合計',     zh: '订单合计',   es: 'Total del pedido' },
  myoActive:     { ko: '진행 중',     en: 'In progress', ja: '進行中',       zh: '进行中',     es: 'En curso' },
  myoPast:       { ko: '지난 내역',   en: 'Past orders', ja: '過去の注文',   zh: '历史订单',   es: 'Anteriores' },
  stepReceived:  { ko: '접수',        en: 'Received',    ja: '受付',         zh: '接单',       es: 'Recibido' },
  stepCooking:   { ko: '조리',        en: 'Cooking',     ja: '調理',         zh: '烹饪',       es: 'Cocina' },
  stepServing:   { ko: '서빙',        en: 'Serving',     ja: '配膳',         zh: '上菜',       es: 'Servir' },
  stWAITING:     { ko: '대기 중',     en: 'Waiting',     ja: '待機中',       zh: '等待中',     es: 'En espera' },
  stRECEIVED:    { ko: '접수됨',      en: 'Received',    ja: '受付済み',     zh: '已接单',     es: 'Recibido' },
  stCOOKING:     { ko: '조리 중',     en: 'Cooking',     ja: '調理中',       zh: '烹饪中',     es: 'Cocinando' },
  stREADY:       { ko: '조리 완료',   en: 'Ready',       ja: '調理完了',     zh: '已就绪',     es: 'Listo' },
  stSERVING:     { ko: '서빙 중',     en: 'Serving',     ja: '配膳中',       zh: '上菜中',     es: 'Sirviendo' },
  stSERVED:      { ko: '서빙 완료',   en: 'Served',      ja: '配膳完了',     zh: '已上菜',     es: 'Servido' },
  stCLOSED:      { ko: '완료',        en: 'Done',        ja: '完了',         zh: '完成',       es: 'Completado' },
  stCANCELLED:   { ko: '취소됨',      en: 'Cancelled',   ja: 'キャンセル',   zh: '已取消',     es: 'Cancelado' },

  // ── 결제 화면 푸터(사업자 정보) ──
  ftSeller:      { ko: '판매자 정보',    en: 'Seller information', ja: '販売者情報',   zh: '卖家信息',   es: 'Información del vendedor' },
  ftOwner:       { ko: '대표자',        en: 'Owner',       ja: '代表者',       zh: '负责人',     es: 'Representante' },
  ftBizNo:       { ko: '사업자등록번호', en: 'Business no.', ja: '事業者登録番号', zh: '营业执照号', es: 'N.º de empresa' },
  ftMailOrder:   { ko: '통신판매업신고번호', en: 'Mail-order license', ja: '通信販売業申告番号', zh: '通信销售业申报号', es: 'Lic. venta a distancia' },
  ftTel:         { ko: '전화',          en: 'Tel',         ja: '電話',         zh: '电话',       es: 'Tel' },
  ftEmail:       { ko: '이메일',        en: 'Email',       ja: 'メール',       zh: '邮箱',       es: 'Correo' },
  ftAddr:        { ko: '주소',          en: 'Address',     ja: '住所',         zh: '地址',       es: 'Dirección' },
}

/** UI 문구를 현재 언어로. 없으면 한국어로 폴백. */
export function ui(key, lang) {
  const row = UI[key]
  if (!row) return key
  return row[lang] || row.ko || key
}
