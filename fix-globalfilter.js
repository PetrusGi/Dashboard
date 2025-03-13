// fix-globalfilter.js - Fixes for global filter functionality

// This script ensures that leadMagnets property is consistently used in the codebase
// instead of the inconsistent 'leadmagnets' (lowercase) that might be used in some places

document.addEventListener('DOMContentLoaded', function() {
    console.log("Applying leadMagnets property name fixes...");
    
    // Override the original filterleadmagnetsList function to use the correct property name
    if (typeof filterLeadMagnetsList === 'function') {
        console.log("Fixing filterLeadMagnetsList function...");
        
        // Make sure we're using the correct property name in all competitor objects
        fetchData('competitors.json')
            .then(competitors => {
                competitors.forEach(competitor => {
                    // If the competitor has a 'leadmagnets' property but not 'leadMagnets'
                    if (competitor.leadmagnets && !competitor.leadMagnets) {
                        // Copy the value to the correct property name
                        competitor.leadMagnets = competitor.leadmagnets;
                        // Delete the incorrect property
                        delete competitor.leadmagnets;
                    }
                });
                
                // Save the updated competitors data
                saveData('competitors.json', competitors)
                    .then(() => {
                        console.log("Fixed leadMagnets property in competitors data");
                        // Refresh the data to reflect the changes
                        initializeData();
                    })
                    .catch(error => {
                        console.error("Error saving fixed competitors data:", error);
                    });
            })
            .catch(error => {
                console.error("Error fetching competitors data for fixing:", error);
            });
    }
    
    // Fix search functionality for lead magnets
    const leadMagnetSearch = document.getElementById('leadmagnet-search');
    if (leadMagnetSearch) {
        console.log("Fixing lead magnet search functionality...");
        
        // Remove any existing event listeners
        const newSearch = leadMagnetSearch.cloneNode(true);
        leadMagnetSearch.parentNode.replaceChild(newSearch, leadMagnetSearch);
        
        // Add the correct event listener
        newSearch.addEventListener('input', () => {
            const searchTerm = newSearch.value.toLowerCase();
            const leadMagnetItems = document.querySelectorAll('#leadmagnet-list .list-item');
            
            leadMagnetItems.forEach(item => {
                const text = item.querySelector('.list-item-name').textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
    // Fix tag suggestions for lead magnets
    const setupTagSuggestionsOriginal = window.setupTagSuggestions;
    if (typeof setupTagSuggestionsOriginal === 'function') {
        console.log("Fixing tag suggestions for lead magnets...");
        
        window.setupTagSuggestions = function(inputId, suggestionsId, items) {
            // Call the original function
            setupTagSuggestionsOriginal(inputId, suggestionsId, items);
            
            // Additional fix for leadMagnet input
            if (inputId === 'leadmagnet-input') {
                const input = document.getElementById(inputId);
                const suggestions = document.getElementById(suggestionsId);
                
                if (input && suggestions) {
                    // Remove any existing event listeners
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);
                    
                    // Add the correct event listener
                    newInput.addEventListener('input', () => {
                        const value = newInput.value.toLowerCase();
                        suggestions.innerHTML = '';
                        
                        if (value.length < 2) {
                            suggestions.style.display = 'none';
                            return;
                        }
                        
                        const selectedTags = new Set(
                            Array.from(document.getElementById('selected-leadmagnets').children)
                                .map(tag => tag.textContent.replace('×', '').trim())
                        );
                        
                        const filteredItems = items.filter(item => 
                            item.toLowerCase().includes(value) && !selectedTags.has(item)
                        );
                        
                        if (filteredItems.length === 0) {
                            suggestions.style.display = 'none';
                            return;
                        }
                        
                        filteredItems.forEach(item => {
                            const div = document.createElement('div');
                            div.className = 'suggestion-item';
                            div.textContent = item;
                            div.addEventListener('click', () => {
                                addTag(item, document.getElementById('selected-leadmagnets'), selectedTags);
                                newInput.value = '';
                                suggestions.style.display = 'none';
                            });
                            suggestions.appendChild(div);
                        });
                        
                        suggestions.style.display = 'block';
                    });
                    
                    // Allow adding custom tags with Enter key
                    newInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && newInput.value.trim() !== '') {
                            e.preventDefault();
                            const newTag = newInput.value.trim();
                            addTag(newTag, document.getElementById('selected-leadmagnets'), selectedTags);
                            newInput.value = '';
                            suggestions.style.display = 'none';
                        }
                    });
                }
            }
        };
    }
    
    console.log("Lead Magnets fixes applied successfully");
});
