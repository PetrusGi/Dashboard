<?php
// This script handles saving data to JSON files

// Set headers to allow cross-origin requests if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the file to save to
    $file = isset($_GET['file']) ? $_GET['file'] : null;
    
    // Get the JSON data from the request body
    $jsonData = file_get_contents('php://input');
    
    // Validate file parameter
    if (!$file) {
        http_response_code(400);
        echo json_encode(['error' => 'File parameter is required']);
        exit;
    }
    
    // Security check - only allow saving to specific JSON files
    $allowedFiles = ['competitors.json', 'features.json', 'erps.json', 'leadmagnets.json', 'pricing.json'];
    
    if (!in_array($file, $allowedFiles)) {
        http_response_code(403);
        echo json_encode(['error' => 'Not allowed to save to this file']);
        exit;
    }
    
    // Validate JSON data
    if (!$jsonData || !isValidJson($jsonData)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }
    
    // Try to save the data
    try {
        if (file_put_contents($file, $jsonData)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save data']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Exception: ' . $e->getMessage()]);
    }
} else {
    // For non-POST requests
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

// Function to validate JSON
function isValidJson($json) {
    json_decode($json);
    return json_last_error() === JSON_ERROR_NONE;
}
?>
