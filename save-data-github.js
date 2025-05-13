// This script provides GitHub integration for storing JSON data
// It uses the GitHub API to read and write data to a repository

// Configuration - REPLACE THESE VALUES with your own
const GITHUB_CONFIG = {
    owner: 'PetrusGi', // Your GitHub username
    repo: 'SaveData',        // The repository name where data will be stored
    branch: 'main',                // The branch to use (usually 'main' or 'master')
    token: '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'                      // Personal access token (will be provided by the user via prompt)
};

// Store token in sessionStorage so it persists during the session but not permanently
function getGitHubToken() {
    let token = sessionStorage.getItem('github_token');
    
    if (!token) {
        token = prompt(
            'Enter your GitHub Personal Access Token to enable saving data to GitHub.\n\n' +
            'To create a token:\n' +
            '1. Go to https://github.com/settings/tokens\n' +
            '2. Click "Generate new token"\n' +
            '3. Give it a name like "Dashboard Data"\n' +
            '4. Select the "repo" scope\n' +
            '5. Click "Generate token"\n' +
            '6. Copy the token and paste it here\n\n' +
            'This token will be stored in your browser session only, so save it.'
            'It takes 30 seconds to a minute, for your changes to update.'
        );
        
        if (token) {
            sessionStorage.setItem('github_token', token);
        }
    }
    
    return token;
}

// Function to fetch a file from GitHub
async function fetchFileFromGitHub(filename) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token is required to fetch data');
    }
    
    try {
        // First, try to get the file
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}`,
            {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (response.status === 404) {
            // File doesn't exist, return default data
            console.log(`File ${filename} not found in GitHub repository, using default data`);
            return getDefaultData(filename);
        }
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // Content is Base64 encoded, decode it
        const content = atob(data.content);
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error fetching ${filename} from GitHub:`, error);
        // Return default data if fetch fails
        return getDefaultData(filename);
    }
}

// Function to save a file to GitHub
async function saveFileToGitHub(filename, data) {
    const token = getGitHubToken();
    if (!token) {
        throw new Error('GitHub token is required to save data');
    }
    
    try {
        // First, try to get the file to get its SHA (needed for updating)
        let sha = null;
        try {
            const response = await fetch(
                `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}?ref=${GITHUB_CONFIG.branch}`,
                {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const fileData = await response.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist yet, that's okay
            console.log(`File ${filename} doesn't exist yet, will create it`);
        }
        
        // Prepare the request body
        const requestBody = {
            message: `Update ${filename}`,
            content: btoa(JSON.stringify(data, null, 2)), // Base64 encode the content
            branch: GITHUB_CONFIG.branch
        };
        
        // If we have a SHA, include it (for updating existing file)
        if (sha) {
            requestBody.sha = sha;
        }
        
        // Now create or update the file
        const saveResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify(requestBody)
            }
        );
        
        if (!saveResponse.ok) {
            const errorData = await saveResponse.json();
            throw new Error(`GitHub API error: ${saveResponse.status} ${saveResponse.statusText} - ${JSON.stringify(errorData)}`);
        }
        
        // Show a success notification
        showGitHubSaveNotification(filename);
        
        return { success: true };
    } catch (error) {
        console.error(`Error saving ${filename} to GitHub:`, error);
        showGitHubErrorNotification(filename, error.message);
        throw error;
    }
}

// Function to show a notification when data is saved to GitHub
function showGitHubSaveNotification(file) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('github-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'github-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);
    }
    
    // Customize message based on filename
    let customMessage;
    switch(file) {
        case 'competitors.json':
            customMessage = 'Competitor data has been saved successfully.';
            break;
        case 'features.json':
            customMessage = 'Feature data has been saved successfully.';
            break;
        case 'erps.json':
            customMessage = 'ERP integration data has been saved successfully.';
            break;
        case 'leadmagnets.json':
            customMessage = 'Lead magnet data has been saved successfully.';
            break;
        case 'pricing.json':
            customMessage = 'Pricing data has been saved successfully.';
            break;
        default:
            customMessage = 'Your data has been saved successfully.';
    }
    
    notification.textContent = customMessage;
    notification.style.backgroundColor = '#4CAF50'; // Green for success
    notification.style.opacity = '1';
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 5000);
}

// Function to show an error notification
function showGitHubErrorNotification(file, errorMessage) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('github-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'github-notification';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.color = 'white';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);
    }
    
    // Customize message based on filename
    let customType;
    switch(file) {
        case 'competitors.json':
            customType = 'competitor data';
            break;
        case 'features.json':
            customType = 'feature data';
            break;
        case 'erps.json':
            customType = 'ERP integration data';
            break;
        case 'leadmagnets.json':
            customType = 'lead magnet data';
            break;
        case 'pricing.json':
            customType = 'pricing data';
            break;
        default:
            customType = 'data';
    }
    
    notification.textContent = `Error saving ${customType}: ${errorMessage}`;
    notification.style.backgroundColor = '#F44336'; // Red for error
    notification.style.opacity = '1';
    
    // Hide notification after 8 seconds (longer for errors)
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 8000);
}

// Get default empty data structure based on file type (copied from data.js)
function getDefaultData(filename) {
    switch (filename) {
        case 'competitors.json':
            return [];
        case 'features.json':
            return extractFeaturesFromDoc();
        case 'erps.json':
            return extractERPsFromDoc();
        case 'leadmagnets.json':
            return ["ROI Calculator", "Whitepaper", "Case Study", "Webinar", "Free Trial"];
        case 'pricing.json':
            return [];
        default:
            return [];
    }
}

// These functions should be defined elsewhere, but we're including stubs for completeness
function extractFeaturesFromDoc() {
    // This would normally be imported from data.js
    return [];
}

function extractERPsFromDoc() {
    // This would normally be imported from data.js
    return [];
}

// Add GitHub configuration UI
function addGitHubConfigUI() {
    // Create a button to open GitHub config
    const configButton = document.createElement('button');
    configButton.id = 'github-config-btn';
    configButton.className = 'action-btn';
    configButton.innerHTML = '<span class="material-icons">settings</span> GitHub Config';
    configButton.style.position = 'fixed';
    configButton.style.bottom = '10px';
    configButton.style.left = '10px';
    configButton.style.zIndex = '999';
    
    // Add click event to open config modal
    configButton.addEventListener('click', openGitHubConfigModal);
    
    // Add to body
    document.body.appendChild(configButton);
}

// Function to open GitHub config modal
function openGitHubConfigModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'github-config-modal modal';
    modal.style.display = 'block';
    
    // Get current config
    const owner = GITHUB_CONFIG.owner === 'YOUR_GITHUB_USERNAME' ? '' : GITHUB_CONFIG.owner;
    const repo = GITHUB_CONFIG.repo === 'YOUR_REPO_NAME' ? '' : GITHUB_CONFIG.repo;
    const branch = GITHUB_CONFIG.branch;
    
    // Create modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeGitHubConfigModal()">&times;</span>
            <h3>GitHub Configuration</h3>
            <div class="edit-form">
                <div class="form-group">
                    <label for="github-username">GitHub Username</label>
                    <input type="text" id="github-username" value="${owner}" placeholder="Your GitHub username">
                </div>
                <div class="form-group">
                    <label for="github-repo">Repository Name</label>
                    <input type="text" id="github-repo" value="${repo}" placeholder="dashboard-data">
                </div>
                <div class="form-group">
                    <label for="github-branch">Branch</label>
                    <input type="text" id="github-branch" value="${branch}" placeholder="main">
                </div>
                <div class="form-group">
                    <label for="github-token">Personal Access Token</label>
                    <input type="password" id="github-token" placeholder="ghp_xxxxxxxxxxxx">
                    <p class="help-text">
                        To create a token, go to <a href="https://github.com/settings/tokens" target="_blank">GitHub Token Settings</a>,
                        click "Generate new token", select the "repo" scope, and click "Generate token". It takes 30 seconds to a minute, for your changes to update.
                    </p>
                </div>
                <div class="form-actions">
                    <button type="button" class="cancel-btn" onclick="closeGitHubConfigModal()">Cancel</button>
                    <button type="button" class="save-btn" onclick="saveGitHubConfig()">Save</button>
                </div>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(modal);
    
    // Add styles for the modal
    const style = document.createElement('style');
    style.textContent = `
        .github-config-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 1000;
            overflow-y: auto;
        }
        
        .github-config-modal .modal-content {
            background-color: white;
            margin: 50px auto;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            max-width: 600px;
            width: 90%;
            position: relative;
        }
        
        .help-text {
            font-size: 0.8em;
            color: #666;
            margin-top: 5px;
        }
    `;
    document.head.appendChild(style);
}

// Function to close GitHub config modal
function closeGitHubConfigModal() {
    const modal = document.querySelector('.github-config-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to save GitHub config
function saveGitHubConfig() {
    const username = document.getElementById('github-username').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    const branch = document.getElementById('github-branch').value.trim() || 'main';
    const token = document.getElementById('github-token').value.trim();
    
    if (!username || !repo) {
        alert('GitHub username and repository name are required.');
        return;
    }
    
    // Update config
    GITHUB_CONFIG.owner = username;
    GITHUB_CONFIG.repo = repo;
    GITHUB_CONFIG.branch = branch;
    
    // Save token to session storage if provided
    if (token) {
        sessionStorage.setItem('github_token', token);
    }
    
    // Save config to localStorage
    localStorage.setItem('github_config', JSON.stringify({
        owner: username,
        repo: repo,
        branch: branch
    }));
    
    // Close modal
    closeGitHubConfigModal();
    
    // Show success notification
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.transition = 'opacity 0.5s';
    notification.textContent = 'GitHub configuration saved successfully.';
    document.body.appendChild(notification);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

// Load GitHub config from localStorage
function loadGitHubConfig() {
    const savedConfig = localStorage.getItem('github_config');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            GITHUB_CONFIG.owner = config.owner || GITHUB_CONFIG.owner;
            GITHUB_CONFIG.repo = config.repo || GITHUB_CONFIG.repo;
            GITHUB_CONFIG.branch = config.branch || GITHUB_CONFIG.branch;
        } catch (error) {
            console.error('Error loading GitHub config:', error);
        }
    }
}

// Override the fetchData and saveData functions in data.js
window.addEventListener('DOMContentLoaded', function() {
    // Load GitHub config
    loadGitHubConfig();
    
    // Add GitHub config UI
    addGitHubConfigUI();
    
    // Define global functions for GitHub config modal
    window.closeGitHubConfigModal = closeGitHubConfigModal;
    window.saveGitHubConfig = saveGitHubConfig;
    
    // Wait for data.js to load first
    setTimeout(() => {
        // Override the fetchData function
        const originalFetchData = window.fetchData;
        window.fetchData = async function(filename) {
            try {
                // If GitHub config is set up, use GitHub
                if (GITHUB_CONFIG.owner !== 'YOUR_GITHUB_USERNAME' && GITHUB_CONFIG.repo !== 'YOUR_REPO_NAME') {
                    return await fetchFileFromGitHub(filename);
                } else {
                    // Otherwise, use the original function
                    return await originalFetchData(filename);
                }
            } catch (error) {
                console.error(`Error fetching ${filename}:`, error);
                // Fall back to original function if GitHub fails
                return await originalFetchData(filename);
            }
        };
        
        // Override the saveData function
        window.saveData = async function(filename, data) {
            try {
                // If GitHub config is set up, use GitHub
                if (GITHUB_CONFIG.owner !== 'YOUR_GITHUB_USERNAME' && GITHUB_CONFIG.repo !== 'YOUR_REPO_NAME') {
                    return await saveFileToGitHub(filename, data);
                } else {
                    // Otherwise, use the download method
                    return await handleSaveData(filename, data);
                }
            } catch (error) {
                console.error(`Error saving ${filename}:`, error);
                throw error;
            }
        };
        
        console.log('GitHub integration enabled');
    }, 500);
});

// Function to handle saving data to JSON files (fallback method)
async function handleSaveData(file, data) {
    // Security check - only allow saving to specific JSON files
    const allowedFiles = ['competitors.json', 'features.json', 'erps.json', 'leadmagnets.json', 'pricing.json'];
    
    if (!allowedFiles.includes(file)) {
        console.error('Not allowed to save to this file:', file);
        return { error: 'Not allowed to save to this file' };
    }
    
    try {
        // Create a Blob with the JSON data
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        
        // Create a download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = file;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        
        console.log(`Data saved to ${file}. Please save the downloaded file to your project directory.`);
        
        // Show a notification to the user
        showGitHubSaveNotification(file);
        
        return { success: true };
    } catch (error) {
        console.error('Error saving data:', error);
        return { error: 'Failed to save data' };
    }
}
