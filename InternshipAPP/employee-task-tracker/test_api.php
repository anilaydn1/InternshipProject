<?php

/**
 * Laravel API Test Script
 * Bu script tüm API endpoint'lerini sırasıyla test eder
 */

// API base URL
$baseUrl = 'http://127.0.0.1:8000/api';

// Test verileri
$testUser = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password123'
];

$testTask = [
    'title' => 'Test Görev',
    'description' => 'Bu bir test görevidir'
];

$updatedTask = [
    'title' => 'Güncellenmiş Test Görev',
    'description' => 'Bu güncellenmiş bir test görevidir'
];

// Global değişkenler
$authToken = null;
$taskId = null;

/**
 * HTTP isteği gönder
 */
function makeRequest($method, $url, $data = null, $token = null) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        $token ? 'Authorization: Bearer ' . $token : ''
    ]);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status_code' => $httpCode,
        'body' => json_decode($response, true),
        'raw_response' => $response
    ];
}

/**
 * Test sonucunu yazdır
 */
function printTestResult($testName, $response, $expectedStatus = 200) {
    echo "\n" . str_repeat('=', 50) . "\n";
    echo "TEST: {$testName}\n";
    echo str_repeat('-', 50) . "\n";
    
    $statusColor = $response['status_code'] === $expectedStatus ? '\033[32m' : '\033[31m';
    echo "Status Code: {$statusColor}{$response['status_code']}\033[0m (Beklenen: {$expectedStatus})\n";
    
    if ($response['body']) {
        echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo "Raw Response: {$response['raw_response']}\n";
    }
    
    $success = $response['status_code'] === $expectedStatus;
    $resultColor = $success ? '\033[32m' : '\033[31m';
    echo "Sonuç: {$resultColor}" . ($success ? 'BAŞARILI' : 'BAŞARISIZ') . "\033[0m\n";
    
    return $success;
}

echo "\033[36m";
echo "  _                               _     _    ____ ___   _____ _____ ____ _____ \n";
echo " | |    __ _ _ __ __ ___   _____| |   / \  |  _ \_ _| |_   _| ____/ ___|_   _|\n";
echo " | |   / _` | '__/ _` \ \ / / _ \ |  / _ \ | |_) | |    | | |  _| \___ \ | |  \n";
echo " | |__| (_| | | | (_| |\ V /  __/ | / ___ \|  __/| |    | | | |___ ___) || |  \n";
echo " |_____\__,_|_|  \__,_| \_/ \___|_|/_/   \_\_|  |___|   |_| |_____|____/ |_|  \n";
echo "\033[0m\n";
echo "Laravel API Test Script başlatılıyor...\n";
echo "Base URL: {$baseUrl}\n";

$allTestsPassed = true;

// 1. Kullanıcı Kaydı
$response = makeRequest('POST', $baseUrl . '/register', $testUser);
$testPassed = printTestResult('1. Kullanıcı Kaydı', $response, 201);
$allTestsPassed = $allTestsPassed && $testPassed;

if ($testPassed && isset($response['body']['token'])) {
    $authToken = $response['body']['token'];
    echo "\033[32mToken alındı: " . substr($authToken, 0, 20) . "...\033[0m\n";
}

// 2. Kullanıcı Girişi
$loginData = [
    'email' => $testUser['email'],
    'password' => $testUser['password']
];
$response = makeRequest('POST', $baseUrl . '/login', $loginData);
$testPassed = printTestResult('2. Kullanıcı Girişi', $response, 200);
$allTestsPassed = $allTestsPassed && $testPassed;

if ($testPassed && isset($response['body']['token'])) {
    $authToken = $response['body']['token'];
    echo "\033[32mYeni token alındı: " . substr($authToken, 0, 20) . "...\033[0m\n";
}

// 3. Kullanıcı Bilgilerini Al
$response = makeRequest('GET', $baseUrl . '/user', null, $authToken);
$testPassed = printTestResult('3. Kullanıcı Bilgilerini Al', $response, 200);
$allTestsPassed = $allTestsPassed && $testPassed;

// 4. Yeni Görev Oluştur
$response = makeRequest('POST', $baseUrl . '/tasks', $testTask, $authToken);
$testPassed = printTestResult('4. Yeni Görev Oluştur', $response, 201);
$allTestsPassed = $allTestsPassed && $testPassed;

if ($testPassed && isset($response['body']['data']['id'])) {
    $taskId = $response['body']['data']['id'];
    echo "\033[32mGörev ID: {$taskId}\033[0m\n";
}

// 5. Tüm Görevleri Listele
$response = makeRequest('GET', $baseUrl . '/tasks', null, $authToken);
$testPassed = printTestResult('5. Tüm Görevleri Listele', $response, 200);
$allTestsPassed = $allTestsPassed && $testPassed;

// 6. Görevi Güncelle
if ($taskId) {
    $response = makeRequest('PUT', $baseUrl . '/tasks/' . $taskId, $updatedTask, $authToken);
    $testPassed = printTestResult('6. Görevi Güncelle', $response, 200);
    $allTestsPassed = $allTestsPassed && $testPassed;
} else {
    echo "\n\033[31mGörev ID bulunamadı, güncelleme testi atlanıyor\033[0m\n";
    $allTestsPassed = false;
}

// 7. Güncellenmiş Görevleri Listele
$response = makeRequest('GET', $baseUrl . '/tasks', null, $authToken);
$testPassed = printTestResult('7. Güncellenmiş Görevleri Listele', $response, 200);
$allTestsPassed = $allTestsPassed && $testPassed;

// 8. Görevi Sil
if ($taskId) {
    $response = makeRequest('DELETE', $baseUrl . '/tasks/' . $taskId, null, $authToken);
    $testPassed = printTestResult('8. Görevi Sil', $response, 200);
    $allTestsPassed = $allTestsPassed && $testPassed;
} else {
    echo "\n\033[31mGörev ID bulunamadı, silme testi atlanıyor\033[0m\n";
    $allTestsPassed = false;
}

// 9. Çıkış Yap
$response = makeRequest('POST', $baseUrl . '/logout', null, $authToken);
$testPassed = printTestResult('9. Çıkış Yap', $response, 200);
$allTestsPassed = $allTestsPassed && $testPassed;

// Genel Sonuç
echo "\n" . str_repeat('=', 60) . "\n";
echo "\033[1mGENEL TEST SONUCU\033[0m\n";
echo str_repeat('=', 60) . "\n";

if ($allTestsPassed) {
    echo "\033[32m✓ TÜM TESTLER BAŞARILI!\033[0m\n";
    echo "\033[32mAPI tüm endpoint'lerde doğru çalışıyor.\033[0m\n";
} else {
    echo "\033[31m✗ BAZI TESTLER BAŞARISIZ!\033[0m\n";
    echo "\033[31mLütfen hataları kontrol edin ve düzeltin.\033[0m\n";
}

echo "\nTest tamamlandı.\n";
?>