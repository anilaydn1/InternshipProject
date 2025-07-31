<?php

/**
 * Manuel API Test - Adım adım test
 */

$baseUrl = 'http://127.0.0.1:8000/api';

// Test kullanıcısı
$testUser = [
    'name' => 'Test User',
    'email' => 'test@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123',
    'role' => 'employee'
];

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

echo "=== ADIM 1: Kullanıcı Kaydı ===\n";
$response = makeRequest('POST', $baseUrl . '/register', $testUser);
echo "Status: {$response['status_code']}\n";
echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

if ($response['status_code'] === 201) {
    echo "✓ Kayıt başarılı!\n\n";
    
    echo "=== ADIM 2: Kullanıcı Girişi ===\n";
    $loginData = [
        'email' => $testUser['email'],
        'password' => $testUser['password']
    ];
    
    $response = makeRequest('POST', $baseUrl . '/login', $loginData);
    echo "Status: {$response['status_code']}\n";
    echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
    
    if ($response['status_code'] === 200 && isset($response['body']['token'])) {
        $token = $response['body']['token'];
        echo "✓ Giriş başarılı! Token: " . substr($token, 0, 20) . "...\n\n";
        
        echo "=== ADIM 3: Kullanıcı Bilgileri ===\n";
        $response = makeRequest('GET', $baseUrl . '/user', null, $token);
        echo "Status: {$response['status_code']}\n";
        echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
        
        if ($response['status_code'] === 200) {
            echo "✓ Kullanıcı bilgileri alındı!\n\n";
            
            echo "=== ADIM 4: Görev Oluştur ===\n";
            $taskData = [
                'title' => 'Test Görev',
                'description' => 'Bu bir test görevidir'
            ];
            
            $response = makeRequest('POST', $baseUrl . '/tasks', $taskData, $token);
            echo "Status: {$response['status_code']}\n";
            echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
            
            if ($response['status_code'] === 201 && isset($response['body']['data']['id'])) {
                $taskId = $response['body']['data']['id'];
                echo "✓ Görev oluşturuldu! ID: {$taskId}\n\n";
                
                echo "=== ADIM 5: Görevleri Listele ===\n";
                $response = makeRequest('GET', $baseUrl . '/tasks', null, $token);
                echo "Status: {$response['status_code']}\n";
                echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
                
                echo "=== ADIM 6: Görevi Güncelle ===\n";
                $updateData = [
                    'title' => 'Güncellenmiş Test Görev',
                    'description' => 'Bu güncellenmiş bir test görevidir'
                ];
                
                $response = makeRequest('PUT', $baseUrl . '/tasks/' . $taskId, $updateData, $token);
                echo "Status: {$response['status_code']}\n";
                echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
                
                echo "=== ADIM 7: Görevi Sil ===\n";
                $response = makeRequest('DELETE', $baseUrl . '/tasks/' . $taskId, null, $token);
                echo "Status: {$response['status_code']}\n";
                echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
                
                echo "=== ADIM 8: Çıkış Yap ===\n";
                $response = makeRequest('POST', $baseUrl . '/logout', null, $token);
                echo "Status: {$response['status_code']}\n";
                echo "Response: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
                
            } else {
                echo "✗ Görev oluşturulamadı!\n";
            }
        } else {
            echo "✗ Kullanıcı bilgileri alınamadı!\n";
        }
    } else {
        echo "✗ Giriş başarısız!\n";
        echo "Hata detayı: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }
} else {
    echo "✗ Kayıt başarısız!\n";
    echo "Hata detayı: " . json_encode($response['body'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

echo "Test tamamlandı.\n";
?>