<?php
declare(strict_types=1);

$recipient = 'elena.mascolo@psicoeducando.it';
$subjectPrefix = 'Richiesta dal sito Psicoeducando';

function wants_json(): bool
{
    return isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;
}

function respond(bool $success, string $message, int $status = 200): void
{
    http_response_code($status);
    if (wants_json()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
        exit;
    }

    header('Content-Type: text/html; charset=utf-8');
    $title = $success ? 'Messaggio inviato' : 'Messaggio non inviato';
    echo '<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</title><link rel="stylesheet" href="assets/css/styles.css?v=20260901-17"></head><body><main class="section"><div class="container"><h1>' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</h1><p>' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p><p><a class="btn primary" href="index.html#contatti">Torna al sito</a></p></div></main></body></html>';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Metodo non consentito.', 405);
}

if (!empty($_POST['website'] ?? '')) {
    respond(true, 'Grazie, la tua richiesta è stata ricevuta.');
}

$nome = trim((string) ($_POST['nome'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$telefono = trim((string) ($_POST['telefono'] ?? ''));
$area = trim((string) ($_POST['area'] ?? ''));
$messaggio = trim((string) ($_POST['messaggio'] ?? ''));
$privacy = (string) ($_POST['privacy'] ?? '');

if ($nome === '' || $email === '' || $messaggio === '' || $privacy !== '1') {
    respond(false, 'Compila i campi obbligatori e conferma il consenso al ricontatto.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Inserisci un indirizzo email valido.', 422);
}

function clean_value(string $value): string
{
    return preg_replace('/[\r\n]+/', ' ', strip_tags($value)) ?? '';
}

$body = [
    'Nuova richiesta dal sito Psicoeducando',
    '',
    'Nome: ' . clean_value($nome),
    'Email: ' . clean_value($email),
    'Telefono: ' . ($telefono !== '' ? clean_value($telefono) : 'Non indicato'),
    'Area: ' . ($area !== '' ? clean_value($area) : 'Non indicata'),
    '',
    'Messaggio:',
    strip_tags($messaggio),
    '',
    'Consenso al ricontatto: si',
];

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Psicoeducando <noreply@psicoeducando.it>',
    'Reply-To: ' . clean_value($nome) . ' <' . $email . '>',
];

$sent = mail($recipient, $subjectPrefix . ' - ' . clean_value($nome), implode("\n", $body), implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'Il messaggio non è partito. Riprova oppure contatta lo studio telefonicamente.', 500);
}

respond(true, 'Grazie, la tua richiesta è stata inviata correttamente.');
