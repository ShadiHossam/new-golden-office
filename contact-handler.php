<?php
header('Content-Type: application/json; charset=utf-8');

function respond($ok, $message) {
    http_response_code($ok ? 200 : 400);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed');
}

// Honeypot — real users never fill this hidden field
if (!empty($_POST['website'])) {
    respond(true, 'OK');
}

$name    = trim($_POST['name'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || $service === '') {
    respond(false, 'الاسم ورقم الهاتف والخدمة مطلوبون');
}
if (mb_strlen($name) > 200 || mb_strlen($phone) > 50 || mb_strlen($service) > 200 || mb_strlen($message) > 5000) {
    respond(false, 'البيانات المدخلة طويلة جداً');
}

$services = [
    'printing' => 'خدمات الطباعة',
    'copiers' => 'ماكينات التصوير والطباعة',
    'cameras' => 'كاميرات المراقبة',
    'ac' => 'أجهزة التكييف',
    'cash-machines' => 'ماكينات فارم وعد النقود',
    'office-supplies' => 'المستلزمات المكتبية',
];
$serviceLabel = $services[$service] ?? $service;

$to = 'info@newgoldenoffice.usine.site';
$subject = '=?UTF-8?B?' . base64_encode('رسالة جديدة من نموذج التواصل — ' . $name) . '?=';

$bodyLines = [
    'الاسم: ' . $name,
    'رقم الهاتف: ' . $phone,
    'الخدمة المطلوبة: ' . $serviceLabel,
    'الرسالة:',
    ($message !== '' ? $message : '(لا توجد رسالة)'),
    '',
    'تم الإرسال من: ' . ($_SERVER['HTTP_HOST'] ?? 'newgoldenoffice.usine.site'),
    'وقت الإرسال: ' . date('Y-m-d H:i:s'),
];
$body = implode("\n", $bodyLines);

$fromDomain = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'newgoldenoffice.usine.site');
$headers = "From: New Golden Office Website <no-reply@$fromDomain>\r\n";
$headers .= "Reply-To: no-reply@$fromDomain\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    respond(true, 'تم إرسال رسالتك بنجاح');
} else {
    respond(false, 'حدث خطأ أثناء الإرسال، برجاء المحاولة عبر واتساب');
}
