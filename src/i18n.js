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
  totalPay:      { ko: '총 결제금액', en: 'Total',       ja: '合計金額',     zh: '合计金额',   es: 'Total a pagar' },
  paying:        { ko: '결제 처리 중…', en: 'Processing…', ja: '決済処理中…', zh: '支付处理中…', es: 'Procesando…' },
  payNow:        { ko: '결제하기',    en: 'Pay',         ja: '支払う',       zh: '去支付',     es: 'Pagar' },
  payFail:       { ko: '결제에 실패했어요. 다시 시도해 주세요.', en: 'Payment failed. Please try again.', ja: '決済に失敗しました。もう一度お試しください。', zh: '支付失败，请重试。', es: 'El pago falló. Inténtalo de nuevo.' },
  payTransfer:   { ko: '계좌이체',    en: 'Bank transfer', ja: '口座振込',   zh: '银行转账',   es: 'Transferencia' },
  payCard:       { ko: '신용·체크카드', en: 'Credit/Debit card', ja: 'クレジット・デビットカード', zh: '信用卡/借记卡', es: 'Tarjeta' },
  payKakao:      { ko: '카카오페이',  en: 'KakaoPay',    ja: 'カカオペイ',   zh: 'KakaoPay',   es: 'KakaoPay' },
  payToss:       { ko: '토스페이',    en: 'TossPay',     ja: 'トスペイ',     zh: 'TossPay',    es: 'TossPay' },

  // ── 내 주문 내역 시트(MyOrdersSheet) ──
  myOrdersTitle: { ko: '내 주문 내역', en: 'My orders',  ja: '注文履歴',     zh: '我的订单',   es: 'Mis pedidos' },
  noOrders:      { ko: '아직 주문 내역이 없어요.', en: 'No orders yet.', ja: 'まだ注文履歴がありません。', zh: '暂无订单。', es: 'Aún no hay pedidos.' },
  orderTotal:    { ko: '주문 합계',   en: 'Order total', ja: '注文合計',     zh: '订单合计',   es: 'Total del pedido' },
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
}

/** UI 문구를 현재 언어로. 없으면 한국어로 폴백. */
export function ui(key, lang) {
  const row = UI[key]
  if (!row) return key
  return row[lang] || row.ko || key
}
