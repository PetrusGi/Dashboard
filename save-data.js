// This script replaces save-data.php functionality for Live Server
// It uses the Fetch API to save data to JSON files

// Function to handle saving data to JSON files
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
        showSaveNotification(file);
        
        return { success: true };
    } catch (error) {
        console.error('Error saving data:', error);
        return { error: 'Failed to save data' };
    }
}

// Function to show a notification when data is saved
function showSaveNotification(file) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('save-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'save-notification';
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
    
    // Set notification message
    notification.textContent = `${file} has been downloaded. Please save it to your project directory.`;
    notification.style.opacity = '1';
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 5000);
}

// Override the saveData function in data.js
window.addEventListener('DOMContentLoaded', function() {
    // Wait for data.js to load first
    setTimeout(() => {
        // Override the saveData function
        window.saveData = async function(filename, data) {
            try {
                const result = await handleSaveData(filename, data);
                if (result.error) {
                    throw new Error(result.error);
                }
                return result;
            } catch (error) {
                console.error(`Error saving ${filename}:`, error);
                throw error;
            }
        };
        
        console.log('Save data function overridden for Live Server');
    }, 500);
});

// Add styles for the notification
const style = document.createElement('style');
style.textContent = `
    #save-notification {
        opacity: 0;
    }
    
    #save-notification.show {
        opacity: 1;
    }
`;
document.head.appendChild(style);
