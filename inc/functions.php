<?php

/**
 * Повертає об'єкт PDO, підключений до файлу SQLite,
 * та створює таблиці (якщо вони ще не існують).
 */
function getDBConnection() {
    // Файл з БД лежить у папці ../db/ відносно цього файлу
    $dbPath = __DIR__ . '/../db/database.sqlite';

    // Створюємо підключення
    $pdo = new PDO('sqlite:' . $dbPath);
    // Увімкнемо режим викидання винятків при помилках
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Створимо таблиці, якщо вони не існують
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            phone TEXT,
            service TEXT,
            comments TEXT,
            price TEXT,  
            created_at DATETIME
        );

        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            geo_data TEXT,
            created_at DATETIME
        );
    ");

    return $pdo;
}