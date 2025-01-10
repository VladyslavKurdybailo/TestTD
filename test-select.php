<?php
// Підключаємо файл із функцією getDBConnection()
require_once __DIR__ . '/inc/functions.php'; // або інший шлях, якщо у вас по-іншому

$db = getDBConnection();

// Виконуємо SELECT
$stmt = $db->query("SELECT * FROM contacts"); // або назва іншої таблиці
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Виводимо результати
echo "<pre>";
print_r($rows);
echo "</pre>";