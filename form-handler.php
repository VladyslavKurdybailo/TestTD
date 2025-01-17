<?php
/**
 * form-handler.php
 * Обробник двох форм:
 *   - QUICK APPOINTMENT (#contactform1)
 *   - GET AN APPOINTMENT (#contactform)
 * - Повертає JSON-відповідь (success, message, redirectUrl).
 * - Зберігає дані у SQLite (contacts).
 * - Здійснюється валідація даних.
 * - Логує запити у файл.
 * - Додає геодані (приклад).
 */

// Встановлюємо заголовок, щоб повернути JSON
header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/inc/functions.php';

try {
    // Перевірка CSRF-токену
    $csrfToken = $_POST['csrf_token'] ?? '';
    $sessionCsrfToken = $_SESSION['csrf_token'] ?? '';

    if ($csrfToken !== $sessionCsrfToken || empty($csrfToken)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid CSRF token. Please try again.',
        ]);
        exit;
    }
    // Зчитуємо поля з $_POST (від обох форм)
    $firstName  = trim($_POST['first_name']  ?? '');
    $lastName   = trim($_POST['last_name']   ?? '');
    $email      = trim($_POST['email']       ?? '');
    $phone      = trim($_POST['phone']       ?? '');
    $service    = trim($_POST['select_service'] ?? '');
    $price      = trim($_POST['select_price']   ?? '');
    $comments   = trim($_POST['comments']    ?? '');

    // (Опціонально) Можна визначити тип форми, якщо треба розрізняти
    // $formType = isset($_POST['first_name1']) ? 'quick' : 'appointment';

    // ВАЛІДАЦІЯ
    $errors = [];
    // Перевірка імені
    if ($firstName === '') {
        $errors[] = "You must enter your first name.";
    }
    // Перевірка прізвища
    if ($lastName === '') {
        $errors[] = "You must enter your last name.";
    }
    // Перевірка email
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email address.";
    }
    // Перевірка телефону (примітивний варіант: + і 7-15 цифр)
    if (!preg_match('/^\+?\d{7,15}$/', $phone)) {
        $errors[] = "Invalid phone number.";
    }
    // Валідація коментарів (опціонально: перевірка на XSS)
    if (!empty($comments) && strlen($comments) > 500) {
        $errors[] = "Comments should not exceed 500 characters.";
    } elseif (!empty($comments)) {
        $comments = htmlspecialchars($comments, ENT_QUOTES, 'UTF-8'); // Захист від XSS
    }
    if (!empty($errors)) {
        // Повертаємо JSON з помилками
        echo json_encode([
            'success' => false,
            'message' => implode(' ', $errors),
            'redirectUrl' => null
        ]);
        exit;
    }

    // ОТРИМАННЯ ГЕОДАНИХ
    // (Приклад фейкових, або можна викликати реальне API, наприклад ipinfo.io)
    $ip = $_SERVER['REMOTE_ADDR'];
    $geoData = [
        'ip'      => $ip,
        'country' => 'Unknown',
        'city'    => 'Unknown'
    ];
    // Приклад реального виклику (потрібен токен від ipinfo.io):
    /*
    $token = 'YOUR_TOKEN_HERE';
    $response = @file_get_contents("https://ipinfo.io/{$ip}/json?token={$token}");
    if ($response) {
        $geoDecoded = json_decode($response, true);
        $geoData = $geoDecoded ?: $geoData; // якщо json_decode поверне null, лишаємо за замовчуванням
    }
    */

    // ЛОГУВАННЯ ЗАПИТУ
    $logFile = __DIR__ . '/logs/form_requests.log';
    if (!is_dir(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0777, true);
    }
    $logData = sprintf(
        "[%s] Request result:=%s ip=%s\n",
        date('Y-m-d H:i:s'),
        'Success',
        $ip
    );
    file_put_contents($logFile, $logData, FILE_APPEND);

    // ЗБЕРЕЖЕННЯ В БД (SQLite)
    $db = getDBConnection();
    $stmt = $db->prepare("
        INSERT INTO contacts
            (name, email, phone, service, price, comments, geo_data, created_at)
        VALUES
            (:n, :e, :p, :s, :pr, :c, :geo, :created)
    ");
    $stmt->execute([
        ':n'    => $firstName . ' ' . $lastName,
        ':e'    => $email,
        ':p'    => $phone,
        ':s'    => $service,
        ':pr'   => $price,
        ':c'    => $comments,
        ':geo'  => json_encode($geoData),
        ':created' => date('Y-m-d H:i:s'),
    ]);

    // ПОВЕРТАЄМО JSON
    // Якщо треба робити редирект, вкажемо URL
    // Інакше можна лишити null
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully!',
        'redirectUrl' => null // Або null, якщо не треба
    ]);
    exit;

} catch (Exception $e) {
    // Якщо виникла непередбачена помилка
    // Логуємо
    $logFile = __DIR__ . '/logs/form_requests.log';
    $errorData = sprintf("[%s] [FATAL ERROR] %s\n", date('Y-m-d H:i:s'), $e->getMessage());
    file_put_contents($logFile, $errorData, FILE_APPEND);

    // І повертаємо JSON із помилкою
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'redirectUrl' => null
    ]);
    exit;
}