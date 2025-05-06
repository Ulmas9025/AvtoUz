<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['image'])) {
    $file = $_FILES['image'];
    
    // Проверка типа файла
    $allowed_types = ['image/jpeg'];
    $mime_type = mime_content_type($file['tmp_name']);
    
    if (!in_array($mime_type, $allowed_types)) {
        echo json_encode(['success' => false, 'error' => 'Только JPG файлы разрешены']);
        exit;
    }
    
    // Чтение файла
    $imageData = file_get_contents($file['tmp_name']);
    $filename = basename($file['name']);
    $file_size = $file['size'];
    
    try {
        $stmt = $pdo->prepare("INSERT INTO images (filename, mime_type, image_data, file_size) VALUES (?, ?, ?, ?)");
        $stmt->execute([$filename, $mime_type, $imageData, $file_size]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Ошибка базы данных: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Неверный запрос']);
}
?>