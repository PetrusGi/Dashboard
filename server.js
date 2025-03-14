// Simple Node.js server for the Competition Analysis Dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Create the server
const server = http.createServer((req, res) => {
    // Parse the URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    
    // If the path ends with a slash or is empty, serve index.html
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }
    
    // Handle save-data.php requests
    if (pathname === '/save-data.php') {
        handleSaveData(req, res, parsedUrl.query);
        return;
    }
    
    // Get the file path
    const filePath = path.join(__dirname, pathname);
    
    // Get the file extension
    const ext = path.extname(filePath);
    
    // Set the content type
    const contentType = MIME_TYPES[ext] || 'text/plain';
    
    // Read the file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            // If the file doesn't exist, create an empty JSON file for data files
            if (err.code === 'ENOENT' && ext === '.json') {
                const defaultContent = pathname.includes('competitors') ? '[]' : '[]';
                fs.writeFile(filePath, defaultContent, 'utf8', (err) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error creating JSON file');
                        return;
                    }
                    
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(defaultContent, 'utf8');
                });
                return; // ✅ Moved return inside this block
            }
            
            // For other files, return 404
            res.writeHead(404);
            res.end(`File not found: ${pathname}`);
            return;
        }
        
        // Return the file content
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

// Handle save-data.php requests
function handleSaveData(req, res, query) {
    // Check if it's a POST request
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    // Get the file to save to
    const file = query.file;
    
    // Validate file parameter
    if (!file) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File parameter is required' }));
        return;
    }
    
    // Security check - only allow saving to specific JSON files
    const allowedFiles = ['competitors.json', 'features.json', 'erps.json', 'leadmagnets.json', 'pricing.json'];
    
    if (!allowedFiles.includes(file)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not allowed to save to this file' }));
        return;
    }
    
    // Get the JSON data from the request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        // Validate JSON data
        try {
            JSON.parse(body);
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON data' }));
            return;
        }
        
        // Save the data to the file
        fs.writeFile(path.join(__dirname, file), body, 'utf8', (err) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to save data' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    });
} // ✅ Added missing closing brace for `handleSaveData()`

// ✅ Moved server.listen() outside of all functions
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
});
