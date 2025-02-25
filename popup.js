document.addEventListener('DOMContentLoaded', function() {
    // Toggle switch functionality
    const checkbox = document.querySelector('input[type="checkbox"]');
    const switchLabel = document.querySelector('.switch');
    const micIcon = document.querySelector('.mic-icon');

    // Set initial tooltip
    switchLabel.setAttribute('data-tooltip', 'Click to mute');

    // Add inline style to ensure size is set correctly
    if (micIcon) {
        // Default size is set by the SVG element attributes
    }

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            // Muted state
            switchLabel.setAttribute('data-tooltip', 'Click to unmute');
            micIcon.style.stroke = '#ff0000'; // Set to red when muted for SVG
        } else {
            // Unmuted state
            switchLabel.setAttribute('data-tooltip', 'Click to mute');
            micIcon.style.stroke = '#000000'; // Set to black when unmuted for SVG
        }
    });

    // Handle class box click events
    const classBoxes = document.querySelectorAll('.class-box');
    
    // Active class tracking
    let activeClass = null;
    
    // Add click event to each class box
    classBoxes.forEach(box => {
        box.addEventListener('click', function() {
            const channelId = this.getAttribute('data-channel');
            
            // If clicking the same class that's already active, leave the class
            if (activeClass === this) {
                leaveVoiceChannel(channelId);
                this.classList.remove('active');
                activeClass = null;
            } 
            // Otherwise join the new class
            else {
                // If there was a previously active class, leave it first
                if (activeClass) {
                    const previousChannelId = activeClass.getAttribute('data-channel');
                    leaveVoiceChannel(previousChannelId);
                    activeClass.classList.remove('active');
                }
                
                // Join the new class
                joinVoiceChannel(channelId);
                this.classList.add('active');
                activeClass = this;
            }
        });
    });
    
    function joinVoiceChannel(channelId) {
        console.log(`Joining voice channel: ${channelId}`);
        // Here you would implement your actual voice channel joining logic
        // For example:
        // sendMessageToBackground({ action: 'joinVoiceChannel', channelId: channelId });
        
        // Show a notification
        showNotification(`JOINED ${getClassName(channelId)}`);
    }
    
    function leaveVoiceChannel(channelId) {
        console.log(`Leaving voice channel: ${channelId}`);
        // Here you would implement your actual voice channel leaving logic
        // For example:
        // sendMessageToBackground({ action: 'leaveVoiceChannel', channelId: channelId });
        
        // Show a notification with the "left" type to make it red
        showNotification(`LEFT ${getClassName(channelId)}`, 'left');
    }
    
    // Helper to get readable class name from channel ID
    function getClassName(channelId) {
        const classMap = {
            'math101': 'Math 101',
            'science205': 'Science 205',
            'history110': 'History 110',
            'english220': 'English 220'
        };
        return classMap[channelId] || channelId;
    }
    
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
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});
