<?php
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? '';
$date = $data['date'] ?? date('Y-m-d H:i:s');

try {
    $stmt = $pdo->prepare("INSERT INTO scans (qr_id, scan_date) VALUES (?, ?)");
    $stmt->execute([$id, $date]);
    
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>