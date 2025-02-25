document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.querySelector('input[type="checkbox"]');
    const switchLabel = document.querySelector('.switch');

    // Set initial tooltip
    switchLabel.setAttribute('data-tooltip', 'Click to mute');

    checkbox.addEventListener('change', function() {
        if (this.checked) {
            switchLabel.setAttribute('data-tooltip', 'Click to unmute');
        } else {
            switchLabel.setAttribute('data-tooltip', 'Click to mute');
        }
    });
});