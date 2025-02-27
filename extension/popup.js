document.addEventListener('DOMContentLoaded', function() {
    // Toggle switch functionality
    const checkbox = document.querySelector('input[type="checkbox"]');
    const switchLabel = document.querySelector('.switch');
    const micIcon = document.querySelector('.mic-icon');
    const classGrid = document.querySelector('.class-grid');
    const sectionTitle = document.querySelector('.section-title');

    // API endpoint for fetching courses
    const API_URL = 'http://127.0.0.1:5000/api/courses';
    
    // Set initial tooltip
    switchLabel.setAttribute('data-tooltip', 'Click to mute');

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

    // Check if API key is set in Chrome storage
    chrome.storage.sync.get(['canvasApiKey', 'canvasApiUrl'], function(data) {
        if (!data.canvasApiKey) {
            // No API key set, show message and prompt to go to settings
            showApiKeyRequiredMessage();
        } else {
            // API key exists, fetch courses with the stored key
            fetchCourses(data.canvasApiKey, data.canvasApiUrl || 'https://canvas.instructure.com');
        }
    });

    // Show message when API key is not set
    function showApiKeyRequiredMessage() {
        classGrid.innerHTML = '';
        sectionTitle.textContent = 'Setup Required';
        
        const msgContainer = document.createElement('div');
        msgContainer.className = 'api-key-message';
        msgContainer.style.gridColumn = '1 / -1';
        msgContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        msgContainer.style.borderRadius = '8px';
        msgContainer.style.padding = '20px';
        msgContainer.style.textAlign = 'center';
        msgContainer.style.color = '#333';
        
        const msgTitle = document.createElement('h4');
        msgTitle.style.color = '#1915ff';
        msgTitle.style.marginTop = '0';
        msgTitle.textContent = 'Canvas API Key Required';
        
        const msgText = document.createElement('p');
        msgText.textContent = 'To use Focus, you need to provide your Canvas API key. This allows the extension to access your course information.';
        
        const setupButton = document.createElement('button');
        setupButton.textContent = 'Set Up API Key';
        setupButton.style.backgroundColor = '#1915ff';
        setupButton.style.color = 'white';
        setupButton.style.border = 'none';
        setupButton.style.padding = '10px 20px';
        setupButton.style.borderRadius = '5px';
        setupButton.style.cursor = 'pointer';
        setupButton.style.fontFamily = '"Times New Roman", Times, serif';
        setupButton.style.fontWeight = 'bold';
        setupButton.style.marginTop = '15px';
        
        setupButton.addEventListener('click', function() {
            window.location.href = 'settings.html';
        });
        
        msgContainer.appendChild(msgTitle);
        msgContainer.appendChild(msgText);
        msgContainer.appendChild(setupButton);
        classGrid.appendChild(msgContainer);
    }

    // Fetch courses from Canvas API through Flask backend
    async function fetchCourses(apiKey, apiUrl) {
        try {
            showLoadingIndicator();
            
            console.log('Fetching courses with API key:', apiKey.substring(0, 8) + '...');
            
            // Use POST to send API key securely
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    api_key: apiKey,
                    api_url: apiUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
            
            const courses = await response.json();
            
            // Clear loading indicator
            hideLoadingIndicator();
            
            if (courses.error) {
                if (courses.error.includes('unauthorized')) {
                    // Invalid API key
                    showError('Your Canvas API key appears to be invalid. Please check your settings.');
                    setTimeout(() => {
                        window.location.href = 'settings.html';
                    }, 3000);
                    return;
                }
                showError(`Error: ${courses.error}`);
                return;
            }
            
            if (courses.length === 0) {
                showNoCoursesMessage();
                return;
            }
            
            // Populate the grid with courses
            populateClassGrid(courses);
            
            // Setup event handlers for the newly created class boxes
            setupClassBoxEventHandlers();
            
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            hideLoadingIndicator();
            showError('Failed to load your courses. Please try again later. Check that the Flask server is running at http://127.0.0.1:5000');
        }
    }
    
    // Show loading indicator
    function showLoadingIndicator() {
        // Clear existing classes
        classGrid.innerHTML = '';
        
        // Add loading message
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-indicator';
        loadingEl.innerHTML = 'Loading your courses...';
        loadingEl.style.gridColumn = '1 / -1';
        loadingEl.style.textAlign = 'center';
        loadingEl.style.padding = '20px';
        loadingEl.style.color = '#ffffff';
        classGrid.appendChild(loadingEl);
    }
    
    // Hide loading indicator
    function hideLoadingIndicator() {
        const loadingEl = document.querySelector('.loading-indicator');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    // Show error message
    function showError(message) {
        classGrid.innerHTML = '';
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = message;
        errorEl.style.gridColumn = '1 / -1';
        errorEl.style.textAlign = 'center';
        errorEl.style.padding = '20px';
        errorEl.style.color = '#ff6666';
        classGrid.appendChild(errorEl);
        
        // Show notification
        showNotification(message, 'error');
    }
    
    // Show message when no courses are available
    function showNoCoursesMessage() {
        classGrid.innerHTML = '';
        const msgEl = document.createElement('div');
        msgEl.className = 'no-courses-message';
        msgEl.innerHTML = 'You are not enrolled in any active courses.';
        msgEl.style.gridColumn = '1 / -1';
        msgEl.style.textAlign = 'center';
        msgEl.style.padding = '20px';
        msgEl.style.color = '#ffffff';
        classGrid.appendChild(msgEl);
    }
    
    // Populate class grid with course data
    function populateClassGrid(courses) {
        // Clear grid first
        classGrid.innerHTML = '';
        
        // Add each course as a class box
        courses.forEach(course => {
            const classBox = document.createElement('div');
            classBox.className = 'class-box';
            classBox.setAttribute('data-channel', course.id);
            
            const title = document.createElement('h4');
            title.textContent = course.name;
            
            const description = document.createElement('p');
            description.textContent = course.description || course.code;
            
            const students = document.createElement('span');
            students.className = 'participants';
            students.textContent = `${course.students} students`;
            
            classBox.appendChild(title);
            classBox.appendChild(description);
            classBox.appendChild(students);
            
            classGrid.appendChild(classBox);
        });
    }
    
    // Handle class box click events - uses your existing logic
    function setupClassBoxEventHandlers() {
        const classBoxes = document.querySelectorAll('.class-box');
        
        // Active class tracking
        let activeClass = null;
        
        // Add click event to each class box
        classBoxes.forEach(box => {
            box.addEventListener('click', function() {
                const channelId = this.getAttribute('data-channel');
                const channelName = this.querySelector('h4').textContent;
                
                // If clicking the same class that's already active, leave the class
                if (activeClass === this) {
                    leaveVoiceChannel(channelId, channelName);
                    this.classList.remove('active');
                    activeClass = null;
                } 
                // Otherwise join the new class
                else {
                    // If there was a previously active class, leave it first
                    if (activeClass) {
                        const previousChannelId = activeClass.getAttribute('data-channel');
                        const previousChannelName = activeClass.querySelector('h4').textContent;
                        leaveVoiceChannel(previousChannelId, previousChannelName);
                        activeClass.classList.remove('active');
                    }
                    
                    // Join the new class
                    joinVoiceChannel(channelId, channelName);
                    this.classList.add('active');
                    activeClass = this;
                }
            });
        });
    }
    
    function joinVoiceChannel(channelId, channelName) {
        console.log(`Joining voice channel: ${channelId} - ${channelName}`);
        // Here you would implement your actual voice channel joining logic
        // For example:
        // sendMessageToBackground({ action: 'joinVoiceChannel', channelId: channelId });
        
        // Show a notification
        showNotification(`JOINED ${channelName}`);
    }
    
    function leaveVoiceChannel(channelId, channelName) {
        console.log(`Leaving voice channel: ${channelId} - ${channelName}`);
        // Here you would implement your actual voice channel leaving logic
        // For example:
        // sendMessageToBackground({ action: 'leaveVoiceChannel', channelId: channelId });
        
        // Show a notification with the "left" type to make it red
        showNotification(`LEFT ${channelName}`, 'left');
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