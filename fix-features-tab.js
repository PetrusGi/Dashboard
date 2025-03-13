// fix-features-tab.js - Ensures the features tab works correctly

document.addEventListener('DOMContentLoaded', function() {
    console.log("Fixing features tab functionality...");
    
    // Wait for everything to load
    setTimeout(function() {
        // Check if renderFeaturesCompletion function exists
        if (typeof renderFeaturesCompletion === 'function') {
            console.log("Overriding renderFeatures function...");
            
            // Override the renderFeatures function with our complete version
            window.renderFeatures = renderFeaturesCompletion;
            
            // Force re-render of features
            console.log("Re-rendering features...");
            fetchData('features.json')
                .then(features => {
                    if (features && Array.isArray(features)) {
                        renderFeaturesCompletion(features);
                    }
                })
                .catch(error => {
                    console.error("Error fetching features data:", error);
                });
        }
        
        // Fix the add feature button
        const addFeatureBtn = document.getElementById('add-feature-btn');
        if (addFeatureBtn) {
            console.log("Fixing add feature button...");
            
            // Remove any existing event listeners
            const newBtn = addFeatureBtn.cloneNode(true);
            addFeatureBtn.parentNode.replaceChild(newBtn, addFeatureBtn);
            
            // Add the correct event listener
            newBtn.addEventListener('click', function() {
                console.log("Add feature button clicked");
                if (typeof addNewFeature === 'function') {
                    addNewFeature();
                } else {
                    console.error("addNewFeature function not found");
                }
            });
        }
        
        // Fix the feature search functionality
        const featureSearch = document.getElementById('feature-search');
        if (featureSearch) {
            console.log("Fixing feature search functionality...");
            
            // Remove any existing event listeners
            const newSearch = featureSearch.cloneNode(true);
            featureSearch.parentNode.replaceChild(newSearch, featureSearch);
            
            // Add the correct event listener
            newSearch.addEventListener('input', function() {
                const searchTerm = newSearch.value.toLowerCase();
                const featureItems = document.querySelectorAll('.feature-item');
                
                featureItems.forEach(item => {
                    const text = item.querySelector('.list-item-name').textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
    }, 1000); // Wait 1 second for everything to initialize
});
