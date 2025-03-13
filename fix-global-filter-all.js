// fix-global-filter-all.js - Ensures global filter is set to "all" on startup

document.addEventListener('DOMContentLoaded', function() {
    console.log("Ensuring global filter is set to 'all' on startup...");
    
    // Wait for the global filter to be initialized
    setTimeout(function() {
        // Check if global filter state exists
        if (typeof globalFilterState !== 'undefined') {
            console.log("Setting global filter state to 'all'");
            
            // Set all countries selected to true
            globalFilterState.allCountriesSelected = true;
            globalFilterState.isFilterActive = false;
            
            // Make sure all country checkboxes are checked
            const countryCheckboxes = document.querySelectorAll('.country-filter');
            countryCheckboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
            
            // Update the filter button styling
            const filterBtn = document.getElementById('global-country-filter-btn');
            if (filterBtn) {
                filterBtn.classList.remove('filter-active');
                // Remove any existing badge
                const existingBadge = filterBtn.querySelector('.filter-badge');
                if (existingBadge) {
                    filterBtn.removeChild(existingBadge);
                }
            }
            
            // Reset all filtering
            resetGlobalFilters();
        }
    }, 1000); // Wait 1 second for everything to initialize
});
