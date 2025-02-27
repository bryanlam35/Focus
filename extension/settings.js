document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('api-key');
    const canvasUrlInput = document.getElementById('canvas-url');
    const saveButton = document.getElementById('save-button');
    const backButton = document.getElementById('back-button');
    
    // Load saved settings if they exist
    chrome.storage.sync.get(['canvasApiKey', 'canvasApiUrl'], function(data) {
        if (data.canvasApiKey) {
            apiKeyInput.value = data.canvasApiKey;
            console.log('Loaded stored API key:', data.canvasApiKey.substring(0, 8) + '...');
        }
        
        if (data.canvasApiUrl) {
            canvasUrlInput.value = data.canvasApiUrl;
            console.log('Loaded stored API URL:', data.canvasApiUrl);
        }
    });
    
    // Save settings button click handler
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        const canvasUrl = canvasUrlInput.value.trim();
        
        if (!apiKey) {
            showNotification('Please enter your Canvas API key', 'error');
            return;
        }
        
        if (!canvasUrl) {
            showNotification('Please enter your Canvas URL', 'error');
            return;
        }
        
        console.log('Saving API key:', apiKey.substring(0, 8) + '...');
        console.log('Saving API URL:', canvasUrl);
        
        // Save to Chrome storage
        chrome.storage.sync.set({
            canvasApiKey: apiKey,
            canvasApiUrl: canvasUrl
        }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                showNotification('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            showNotification('Settings saved successfully!');
            
            // Verify the settings were saved
            chrome.storage.sync.get(['canvasApiKey'], function(data) {
                console.log('Verified saved API key:', data.canvasApiKey ? 
                    (data.canvasApiKey.substring(0, 8) + '...') : 'not found');
            });
            
            // Navigate back to main screen after a short delay
            setTimeout(() => {
                window.location.href = 'focus.html';
            }, 1500);
        });
    });
    
    // Back button click handler
    backButton.addEventListener('click', function() {
        window.location.href = 'focus.html';
    });
    
    // Function to show notifications
    function showNotification(message, type = 'info') {
        // Check if notification container exists, create if it doesn't
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Log to console as well
        if (type === 'error') {
            console.error(message);
        } else {
            console.log(message);
        }
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});