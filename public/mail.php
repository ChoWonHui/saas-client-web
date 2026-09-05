<?php
/**
 * 디자인 시안 요청서 접수 → 메일 발송.
 *
 * 카페24 웹호스팅(PHP 8.4)에서 동작한다. 프런트(/design)의 요청서를 multipart 로 받아
 * 아래 고정 주소로 보낸다. 첨부는 이미지만 받는다.
 *
 * 보안상 지킨 것 —
 *  1) 받는 주소를 코드에 박는다. 입력값으로 받지 않는다(스팸 중계기로 악용되는 걸 막는다).
 *  2) 헤더에 들어가는 값에서 CR/LF 를 제거한다(헤더 인젝션 차단).
 *  3) 첨부는 확장자·MIME·getimagesize 세 가지를 모두 통과한 이미지만 허용한다.
 *  4) 같은 IP 가 짧은 시간에 반복 전송하지 못하게 막는다.
 *  5) 화면에 숨긴 칸(honeypot)이 채워져 오면 봇으로 보고 조용히 성공 처리한다.
 */

declare(strict_types=1);

const MAIL_TO       = 'jsj3216@gmail.com'; // 받는 사람. 절대 입력값으로 바꾸지 않는다.
const MAX_FILES     = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;   // 장당 5MB
const MAX_TOTAL     = 15 * 1024 * 1024;  // 합계 15MB
const RATE_SECONDS  = 20;                // 같은 IP 재전송 간격
const ALLOWED = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
];

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out(int $code, array $data): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** 헤더에 넣을 값에서 개행을 제거한다. 이게 없으면 임의의 헤더를 끼워 넣을 수 있다. */
function h(string $v): string
{
    return trim(str_replace(["\r", "\n", "\0"], '', $v));
}

/** 한글 제목을 메일 헤더에 안전하게 싣는다. */
function encodeHeader(string $v): string
{
    return '=?UTF-8?B?' . base64_encode(h($v)) . '?=';
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(405, ['ok' => false, 'message' => '잘못된 요청입니다.']);
}

// 봇 차단 — 화면에 보이지 않는 칸이 채워져 있으면 사람이 아니다.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    out(200, ['ok' => true]); // 봇에게는 실패를 알리지 않는다
}

// 같은 IP 연속 전송 제한
$ip   = preg_replace('/[^0-9a-fA-F:.]/', '', (string)($_SERVER['REMOTE_ADDR'] ?? 'x'));
$lock = sys_get_temp_dir() . '/kc_mail_' . md5((string)$ip);
if (is_file($lock) && (time() - (int)filemtime($lock)) < RATE_SECONDS) {
    out(429, ['ok' => false, 'message' => '잠시 후 다시 시도해 주세요.']);
}

$name    = h((string)($_POST['name'] ?? ''));
$email   = h((string)($_POST['email'] ?? ''));
$phone   = h((string)($_POST['phone'] ?? ''));
$concept = h((string)($_POST['concept'] ?? ''));
$accent  = h((string)($_POST['accent'] ?? ''));
$menus   = (string)($_POST['menus'] ?? '');
$texts   = (string)($_POST['texts'] ?? '');
$note    = (string)($_POST['note'] ?? '');

if ($name === '') {
    out(400, ['ok' => false, 'message' => '이름을 입력해 주세요.']);
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    out(400, ['ok' => false, 'message' => '연락받으실 이메일을 정확히 입력해 주세요.']);
}

/* ── 첨부 검사 (이미지만) ───────────────────────────── */
$files = [];
$total = 0;
if (!empty($_FILES['images']['name'][0])) {
    $count = count($_FILES['images']['name']);
    if ($count > MAX_FILES) {
        out(400, ['ok' => false, 'message' => '이미지는 최대 ' . MAX_FILES . '장까지 첨부할 수 있습니다.']);
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);

    for ($i = 0; $i < $count; $i++) {
        if ((int)$_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) {
            out(400, ['ok' => false, 'message' => '파일을 올리지 못했습니다. 크기를 확인해 주세요.']);
        }
        $tmp  = (string)$_FILES['images']['tmp_name'][$i];
        $size = (int)$_FILES['images']['size'][$i];
        $orig = (string)$_FILES['images']['name'][$i];
        $ext  = strtolower((string)pathinfo($orig, PATHINFO_EXTENSION));

        if ($size <= 0 || $size > MAX_FILE_SIZE) {
            out(400, ['ok' => false, 'message' => '이미지 한 장은 5MB 이하만 첨부할 수 있습니다.']);
        }
        $total += $size;
        if ($total > MAX_TOTAL) {
            out(400, ['ok' => false, 'message' => '첨부 파일 합계는 15MB를 넘을 수 없습니다.']);
        }
        // 확장자 · MIME · 실제 이미지인지까지 셋 다 확인한다.
        if (!isset(ALLOWED[$ext]) || !is_uploaded_file($tmp)) {
            out(400, ['ok' => false, 'message' => '이미지 파일(jpg, png, gif, webp)만 첨부할 수 있습니다.']);
        }
        $mime = (string)$finfo->file($tmp);
        if ($mime !== ALLOWED[$ext] || getimagesize($tmp) === false) {
            out(400, ['ok' => false, 'message' => '이미지 파일이 아닙니다.']);
        }
        // 파일명은 우리가 다시 만든다 — 원본 이름을 그대로 쓰면 헤더가 깨질 수 있다.
        $files[] = [
            'name' => sprintf('attach-%02d.%s', $i + 1, $ext),
            'mime' => $mime,
            'data' => (string)file_get_contents($tmp),
        ];
    }
}

/* ── 본문 ──────────────────────────────────────────── */
$lines = [
    '■ 디자인 시안 요청서',
    '',
    '- 이름   : ' . $name,
    '- 이메일 : ' . $email,
    '- 연락처 : ' . ($phone !== '' ? $phone : '-'),
    '',
    '- 선택 시안 : ' . ($concept !== '' ? $concept : '(선택 안 함 — 상담 요청)'),
    '- 포인트 색 : ' . ($accent !== '' ? $accent : '-'),
    '',
    '■ 원하는 메뉴',
    $menus !== '' ? $menus : '(선택 안 함)',
    '',
    '■ 입력하신 문구',
    trim($texts) !== '' ? trim($texts) : '(입력 없음 — 예시 문구 사용)',
    '',
    '■ 요구사항',
    trim($note) !== '' ? trim($note) : '(작성 없음)',
    '',
    '- 첨부 이미지 : ' . count($files) . '장',
    '- 접수 시각   : ' . date('Y-m-d H:i:s'),
];
$body = implode("\n", $lines);

/* ── 메일 조립 ─────────────────────────────────────── */
$boundary = '=_kc_' . bin2hex(random_bytes(12));
$subject  = encodeHeader('[디자인 시안 요청] ' . $name . ($concept !== '' ? ' / ' . $concept : ''));

// From 은 이 서버 도메인으로 둔다. 보낸 사람을 사용자 주소로 두면 스팸으로 분류되기 쉽다.
$headers = [
    'MIME-Version: 1.0',
    'From: KANCHENJUNGA <noreply@' . h((string)($_SERVER['HTTP_HOST'] ?? 'jsj32166.mycafe24.com')) . '>',
    'Reply-To: ' . h($name) . ' <' . $email . '>',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
];

$msg  = "--{$boundary}\r\n";
$msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
$msg .= "Content-Transfer-Encoding: base64\r\n\r\n";
$msg .= chunk_split(base64_encode($body)) . "\r\n";

foreach ($files as $f) {
    $msg .= "--{$boundary}\r\n";
    $msg .= 'Content-Type: ' . $f['mime'] . '; name="' . $f['name'] . "\"\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= 'Content-Disposition: attachment; filename="' . $f['name'] . "\"\r\n\r\n";
    $msg .= chunk_split(base64_encode($f['data'])) . "\r\n";
}
$msg .= "--{$boundary}--";

$sent = mail(MAIL_TO, $subject, $msg, implode("\r\n", $headers));

if (!$sent) {
    out(500, ['ok' => false, 'message' => '메일 발송에 실패했습니다. 잠시 후 다시 시도하거나 직접 메일 주셔도 됩니다.']);
}

touch($lock);
out(200, ['ok' => true, 'message' => '요청서가 접수되었습니다. 확인 후 연락드리겠습니다.']);
