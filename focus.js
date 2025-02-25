document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.querySelector('input[type="checkbox"]');
    const label = document.querySelector('.toggle-label');

    if (checkbox && label) {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                label.textContent = "Muted";
            } else {
                label.textContent = "Unmuted";
            }
        });
    }
});