// globalfilter.js - Manages global filtering functionality

// Store global filter state
const globalFilterState = {
    countries: [],
    allCountriesSelected: true,
    isFilterActive: false
};

// Initialize global filters
function initializeGlobalFilters() {
    console.log("Initializing global filters...");
    // Extract all unique countries from competitors
    fetchData('competitors.json')
        .then(competitors => {
            // Get unique countries
            const countries = [...new Set(competitors.map(comp => comp.country))].filter(Boolean);
            console.log("Found countries:", countries);
            
            // Setup the global country filter functionality
            setupGlobalCountryFilter(countries, competitors);
        })
        .catch(error => {
            console.error('Error initializing global filters:', error);
        });
}

// Setup global country filter
function setupGlobalCountryFilter(countries, competitors) {
    const filterBtn = document.getElementById('global-country-filter-btn');
    const dropdown = document.getElementById('global-country-filter-dropdown');
    
    console.log("Setting up global country filter...");
    console.log("Filter button element:", filterBtn);
    console.log("Dropdown element:", dropdown);
    
    if (!filterBtn || !dropdown) {
        console.error("Filter button or dropdown not found in DOM");
        return;
    }

    // Store all available countries in filter state
    globalFilterState.countries = countries;
    
    // Clear existing options
    dropdown.innerHTML = '';
    
    // Add "All Countries" option
    const allOption = document.createElement('div');
    allOption.className = 'filter-option';
    allOption.innerHTML = `
        <label>
            <input type="checkbox" class="country-filter" value="all" checked>
            All Countries
        </label>
    `;
    dropdown.appendChild(allOption);
    
    // Add country options
    countries.forEach(country => {
        const option = document.createElement('div');
        option.className = 'filter-option';
        option.innerHTML = `
            <label>
                <input type="checkbox" class="country-filter" value="${country}" checked>
                ${country}
            </label>
        `;
        dropdown.appendChild(option);
    });
    
    // Remove any existing event listeners by cloning and replacing the button
    const newBtn = filterBtn.cloneNode(true);
    filterBtn.parentNode.replaceChild(newBtn, filterBtn);
    
    // Toggle dropdown visibility with the new button
    newBtn.addEventListener('click', function(e) {
        console.log("Filter button clicked");
        e.stopPropagation();
        dropdown.classList.toggle('show');
        console.log("Dropdown visibility toggled:", dropdown.classList.contains('show'));
    });
    
    // Handle country filtering
    const countryCheckboxes = document.querySelectorAll('.country-filter');
    countryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log("Country checkbox changed:", checkbox.value, checkbox.checked);
            
            if (checkbox.value === 'all') {
                // If "All Countries" is clicked, update all other checkboxes
                const isChecked = checkbox.checked;
                countryCheckboxes.forEach(cb => {
                    if (cb.value !== 'all') {
                        cb.checked = isChecked;
                    }
                });
                
                globalFilterState.allCountriesSelected = isChecked;
            } else {
                // If a specific country is clicked, update the "All Countries" checkbox
                const allCheckbox = document.querySelector('.country-filter[value="all"]');
                const countryChecks = Array.from(document.querySelectorAll('.country-filter:not([value="all"])'));
                const allChecked = countryChecks.every(cb => cb.checked);
                
                if (allCheckbox) {
                    allCheckbox.checked = allChecked;
                }
                globalFilterState.allCountriesSelected = allChecked;
            }
            
            // Update the filter state
            updateGlobalFilterState();
            
            // Apply global filtering
            applyGlobalFilters();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== newBtn) {
            dropdown.classList.remove('show');
        }
    });
    
    console.log("Global country filter setup complete");
}

// Update global filter state based on UI selections
function updateGlobalFilterState() {
    const selectedCountries = Array.from(document.querySelectorAll('.country-filter:checked'))
        .map(cb => cb.value)
        .filter(value => value !== 'all');
    
    const allSelected = document.querySelector('.country-filter[value="all"]')?.checked;
    
    globalFilterState.countries = selectedCountries;
    globalFilterState.allCountriesSelected = allSelected;
    globalFilterState.isFilterActive = !allSelected;
    
    // Update filter button styling to indicate active filter
    const filterBtn = document.getElementById('global-country-filter-btn');
    if (filterBtn) {
        if (globalFilterState.isFilterActive) {
            filterBtn.classList.add('filter-active');
            // Add a badge with the count of selected countries
            const countBadge = document.createElement('span');
            countBadge.className = 'filter-badge';
            countBadge.textContent = selectedCountries.length;
            
            // Remove any existing badge first
            const existingBadge = filterBtn.querySelector('.filter-badge');
            if (existingBadge) {
                filterBtn.removeChild(existingBadge);
            }
            
            filterBtn.appendChild(countBadge);
        } else {
            filterBtn.classList.remove('filter-active');
            // Remove any existing badge
            const existingBadge = filterBtn.querySelector('.filter-badge');
            if (existingBadge) {
                filterBtn.removeChild(existingBadge);
            }
        }
    }
}

// Apply global filters to all relevant content
function applyGlobalFilters() {
    console.log("Applying global filters, active:", globalFilterState.isFilterActive);
    console.log("Selected countries:", globalFilterState.countries);
    
    // Only apply filtering if we have specific countries selected
    if (!globalFilterState.isFilterActive) {
        // Reset all filtering
        resetGlobalFilters();
        return;
    }

    // Get all competitors
    fetchData('competitors.json')
        .then(competitors => {
            // Filter competitors based on selected countries
            const filteredCompetitors = competitors.filter(comp => 
                globalFilterState.countries.includes(comp.country)
            );
            
            // Apply filters to various sections
            filterCompetitorCards(competitors, filteredCompetitors);
            filterFeaturesList(competitors, filteredCompetitors);
            filterErpsList(competitors, filteredCompetitors);
            filterLeadMagnetsList(competitors, filteredCompetitors);
            filterPricingSections(competitors, filteredCompetitors);
            
            // Update statistics and visualizations
            updateStatisticsWithFilter(competitors, filteredCompetitors);
        })
        .catch(error => {
            console.error('Error applying global filters:', error);
        });
}

// Reset all global filters
function resetGlobalFilters() {
    console.log("Resetting all global filters");
    // Remove country-hidden class from all elements
    document.querySelectorAll('.country-hidden, .country-filtered').forEach(el => {
        el.classList.remove('country-hidden');
        el.classList.remove('country-filtered');
    });
    
    // Re-initialize the data to update statistics and visualizations
    initializeData();
}

// Filter competitor cards
function filterCompetitorCards(allCompetitors, filteredCompetitors) {
    const competitorGrid = document.getElementById('competitors-grid');
    if (!competitorGrid) return;
    
    const competitorCards = competitorGrid.querySelectorAll('.competitor-card');
    
    competitorCards.forEach(card => {
        const competitorId = card.dataset.id;
        const competitor = allCompetitors.find(comp => comp.id === competitorId);
        
        if (competitor && !globalFilterState.countries.includes(competitor.country)) {
            card.classList.add('country-hidden');
        } else {
            card.classList.remove('country-hidden');
        }
    });
}

// Filter features list based on filtered competitors
function filterFeaturesList(allCompetitors, filteredCompetitors) {
    const featureList = document.getElementById('feature-list');
    if (!featureList) return;
    
    // Create a map of feature usage by filtered competitors
    const featureUsage = {};
    
    filteredCompetitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureUsage[feature] = (featureUsage[feature] || 0) + 1;
        });
    });
    
    // Mark features with no usage in filtered competitors
    const featureItems = featureList.querySelectorAll('.feature-item');
    featureItems.forEach(item => {
        const featureName = item.querySelector('.list-item-name').textContent;
        
        if (!featureUsage[featureName]) {
            item.classList.add('country-filtered');
        } else {
            item.classList.remove('country-filtered');
        }
        
        // Update count to show filtered count
        const countElement = item.querySelector('.list-item-count');
        if (countElement) {
            const originalCount = getFeatureCountFromAllCompetitors(featureName, allCompetitors);
            const filteredCount = featureUsage[featureName] || 0;
            
            if (globalFilterState.isFilterActive) {
                countElement.textContent = `${filteredCount} / ${originalCount}`;
            } else {
                countElement.textContent = originalCount;
            }
        }
    });
}

// Get feature count from all competitors
function getFeatureCountFromAllCompetitors(featureName, allCompetitors) {
    let count = 0;
    
    allCompetitors.forEach(competitor => {
        if (competitor.features && competitor.features.includes(featureName)) {
            count++;
        }
    });
    
    return count;
}

// Filter ERPs list based on filtered competitors
function filterErpsList(allCompetitors, filteredCompetitors) {
    const erpList = document.getElementById('erp-list');
    if (!erpList) return;
    
    // Create a map of ERP usage by filtered competitors
    const erpUsage = {};
    
    filteredCompetitors.forEach(competitor => {
        if (!competitor.erps) return;
        competitor.erps.forEach(erp => {
            erpUsage[erp] = (erpUsage[erp] || 0) + 1;
        });
    });
    
    // Mark ERPs with no usage in filtered competitors
    const erpItems = erpList.querySelectorAll('.list-item');
    erpItems.forEach(item => {
        const erpName = item.querySelector('.list-item-name').textContent;
        
        if (!erpUsage[erpName]) {
            item.classList.add('country-filtered');
        } else {
            item.classList.remove('country-filtered');
        }
        
        // Update count to show filtered count
        const countElement = item.querySelector('.list-item-count');
        if (countElement) {
            const originalCount = getErpCountFromAllCompetitors(erpName, allCompetitors);
            const filteredCount = erpUsage[erpName] || 0;
            
            if (globalFilterState.isFilterActive) {
                countElement.textContent = `${filteredCount} / ${originalCount}`;
            } else {
                countElement.textContent = originalCount;
            }
        }
    });
    
    // Update ERP statistics lists
    updateErpStatsList('top-erps-list', allCompetitors, filteredCompetitors);
    updateErpStatsList('least-erps-list', allCompetitors, filteredCompetitors);
}

// Get ERP count from all competitors
function getErpCountFromAllCompetitors(erpName, allCompetitors) {
    let count = 0;
    
    allCompetitors.forEach(competitor => {
        if (competitor.erps && competitor.erps.includes(erpName)) {
            count++;
        }
    });
    
    return count;
}

// Update ERP stats list with filtered data
function updateErpStatsList(listId, allCompetitors, filteredCompetitors) {
    const statsList = document.getElementById(listId);
    if (!statsList) return;
    
    // Get all ERPs and count their usage in filtered competitors
    const erpCounts = {};
    
    filteredCompetitors.forEach(competitor => {
        if (!competitor.erps) return;
        competitor.erps.forEach(erp => {
            erpCounts[erp] = (erpCounts[erp] || 0) + 1;
        });
    });
    
    // Update the list items to show filtered count
    const listItems = statsList.querySelectorAll('li');
    listItems.forEach(item => {
        const erpName = item.textContent.split(' ')[0]; // Get the ERP name (before the count)
        const countElement = item.querySelector('.count');
        
        if (countElement) {
            const originalCount = getErpCountFromAllCompetitors(erpName, allCompetitors);
            const filteredCount = erpCounts[erpName] || 0;
            
            if (globalFilterState.isFilterActive) {
                countElement.textContent = `${filteredCount} / ${originalCount}`;
            } else {
                countElement.textContent = originalCount;
            }
        }
    });
}

// Filter Lead Magnets list based on filtered competitors
function filterLeadMagnetsList(allCompetitors, filteredCompetitors) {
    const leadMagnetList = document.getElementById('leadmagnet-list');
    if (!leadMagnetList) return;
    
    // Create a map of Lead Magnet usage by filtered competitors
    const leadMagnetUsage = {};
    
    filteredCompetitors.forEach(competitor => {
        if (!competitor.leadMagnets) return;
        competitor.leadMagnets.forEach(leadMagnet => {
            leadMagnetUsage[leadMagnet] = (leadMagnetUsage[leadMagnet] || 0) + 1;
        });
    });
    
    // Mark Lead Magnets with no usage in filtered competitors
    const leadMagnetItems = leadMagnetList.querySelectorAll('.list-item');
    leadMagnetItems.forEach(item => {
        const leadMagnetName = item.querySelector('.list-item-name').textContent;
        
        if (!leadMagnetUsage[leadMagnetName]) {
            item.classList.add('country-filtered');
        } else {
            item.classList.remove('country-filtered');
        }
        
        // Update count to show filtered count
        const countElement = item.querySelector('.list-item-count');
        if (countElement) {
            const originalCount = getLeadMagnetCountFromAllCompetitors(leadMagnetName, allCompetitors);
            const filteredCount = leadMagnetUsage[leadMagnetName] || 0;
            
            if (globalFilterState.isFilterActive) {
                countElement.textContent = `${filteredCount} / ${originalCount}`;
            } else {
                countElement.textContent = originalCount;
            }
        }
    });
    
    // Update Lead Magnet statistics lists
    updateLeadMagnetStatsList('top-leadmagnets-list', allCompetitors, filteredCompetitors);
    updateLeadMagnetStatsList('least-leadmagnets-list', allCompetitors, filteredCompetitors);
}

// Get Lead Magnet count from all competitors
function getLeadMagnetCountFromAllCompetitors(leadMagnetName, allCompetitors) {
    let count = 0;
    
    allCompetitors.forEach(competitor => {
        if (competitor.leadMagnets && competitor.leadMagnets.includes(leadMagnetName)) {
            count++;
        }
    });
    
    return count;
}

// Update Lead Magnet stats list with filtered data
function updateLeadMagnetStatsList(listId, allCompetitors, filteredCompetitors) {
    const statsList = document.getElementById(listId);
    if (!statsList) return;
    
    // Get all Lead Magnets and count their usage in filtered competitors
    const leadMagnetCounts = {};
    
    filteredCompetitors.forEach(competitor => {
        if (!competitor.leadMagnets) return;
        competitor.leadMagnets.forEach(leadMagnet => {
            leadMagnetCounts[leadMagnet] = (leadMagnetCounts[leadMagnet] || 0) + 1;
        });
    });
    
    // Update the list items to show filtered count
    const listItems = statsList.querySelectorAll('li');
    listItems.forEach(item => {
        const leadMagnetName = item.textContent.split(' ')[0]; // Get the Lead Magnet name (before the count)
        const countElement = item.querySelector('.count');
        
        if (countElement) {
            const originalCount = getLeadMagnetCountFromAllCompetitors(leadMagnetName, allCompetitors);
            const filteredCount = leadMagnetCounts[leadMagnetName] || 0;
            
            if (globalFilterState.isFilterActive) {
                countElement.textContent = `${filteredCount} / ${originalCount}`;
            } else {
                countElement.textContent = originalCount;
            }
        }
    });
}

// Filter pricing sections based on filtered competitors
function filterPricingSections(allCompetitors, filteredCompetitors) {
    const pricingContainer = document.getElementById('pricing-container');
    if (!pricingContainer) return;
    
    const pricingSections = pricingContainer.querySelectorAll('.pricing-section');
    
    // Filter pricing sections based on competitor country
    pricingSections.forEach(section => {
        const country = section.dataset.country;
        
        if (!globalFilterState.countries.includes(country)) {
            section.classList.add('country-hidden');
        } else {
            section.classList.remove('country-hidden');
        }
    });
}

// Update statistics with filtered data
function updateStatisticsWithFilter(allCompetitors, filteredCompetitors) {
    // Update feature statistics
    updateFeatureStatistics(allCompetitors, filteredCompetitors);
    
    // Update ERP statistics
    updateErpStatistics(allCompetitors, filteredCompetitors);
    
    // Update Lead Magnet statistics
    updateLeadMagnetStatistics(allCompetitors, filteredCompetitors);
    
    // Update visualizations with filtered data
    updateVisualizations(allCompetitors, filteredCompetitors);
}

// Update feature statistics with filtered data
function updateFeatureStatistics(allCompetitors, filteredCompetitors) {
    const totalFeaturesEl = document.getElementById('total-features');
    const avgFeaturesEl = document.getElementById('avg-features');
    
    if (totalFeaturesEl && avgFeaturesEl) {
        // Get unique features from filtered competitors
        const featuresSet = new Set();
        filteredCompetitors.forEach(competitor => {
            if (!competitor.features) return;
            competitor.features.forEach(feature => featuresSet.add(feature));
        });
        
        // Calculate average features per competitor
        const avgFeatures = filteredCompetitors.length ? 
            (filteredCompetitors.reduce((sum, comp) => sum + (comp.features ? comp.features.length : 0), 0) / filteredCompetitors.length).toFixed(1) : 
            '0';
        
        // Update the statistics
        if (globalFilterState.isFilterActive) {
            const totalAllFeatures = document.getElementById('total-features').getAttribute('data-original') || totalFeaturesEl.textContent;
            
            // Store original value if not stored yet
            if (!totalFeaturesEl.getAttribute('data-original')) {
                totalFeaturesEl.setAttribute('data-original', totalFeaturesEl.textContent);
            }
            
            totalFeaturesEl.textContent = `${featuresSet.size} / ${totalAllFeatures}`;
            
            // Store original value for avg features if not stored yet
            if (!avgFeaturesEl.getAttribute('data-original')) {
                avgFeaturesEl.setAttribute('data-original', avgFeaturesEl.textContent);
            }
            
            avgFeaturesEl.textContent = avgFeatures;
        } else {
            // Restore original values if filter is not active
            if (totalFeaturesEl.getAttribute('data-original')) {
                totalFeaturesEl.textContent = totalFeaturesEl.getAttribute('data-original');
            }
            
            if (avgFeaturesEl.getAttribute('data-original')) {
                avgFeaturesEl.textContent = avgFeaturesEl.getAttribute('data-original');
            }
        }
    }
    
    // Update feature leader card
    updateFeatureLeader(allCompetitors, filteredCompetitors);
}

// Update feature leader card with filtered data
function updateFeatureLeader(allCompetitors, filteredCompetitors) {
    const leaderCard = document.getElementById('feature-leader-card');
    if (!leaderCard) return;
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Find the competitor with the most features
        let maxFeatures = 0;
        let leader = null;
        
        filteredCompetitors.forEach(competitor => {
            if (competitor.features && competitor.features.length > maxFeatures) {
                maxFeatures = competitor.features.length;
                leader = competitor;
            }
        });
        
        if (leader) {
            const leaderContent = leaderCard.querySelector('.leader-content');
            if (leaderContent) {
                leaderContent.innerHTML = `
                    <div class="leader-info">
                        <span class="leader-name">${leader.name}</span>
                        <span class="leader-country">${leader.country || ''}</span>
                    </div>
                    <div class="leader-stats">
                        <span class="leader-count">${maxFeatures}</span>
                        <span class="leader-label">Features Implemented</span>
                    </div>
                `;
            }
        }
    } else {
        // Restore original feature leader
        fetchData('competitors.json')
            .then(competitors => {
                // Find the competitor with the most features
                let maxFeatures = 0;
                let leader = null;
                
                competitors.forEach(competitor => {
                    if (competitor.features && competitor.features.length > maxFeatures) {
                        maxFeatures = competitor.features.length;
                        leader = competitor;
                    }
                });
                
                if (leader) {
                    const leaderContent = leaderCard.querySelector('.leader-content');
                    if (leaderContent) {
                        leaderContent.innerHTML = `
                            <div class="leader-info">
                                <span class="leader-name">${leader.name}</span>
                                <span class="leader-country">${leader.country || ''}</span>
                            </div>
                            <div class="leader-stats">
                                <span class="leader-count">${maxFeatures}</span>
                                <span class="leader-label">Features Implemented</span>
                            </div>
                        `;
                    }
                }
            });
    }
}

// Update ERP statistics with filtered data
function updateErpStatistics(allCompetitors, filteredCompetitors) {
    const totalErpsEl = document.getElementById('total-erps');
    const avgErpsEl = document.getElementById('avg-erps');
    
    if (totalErpsEl && avgErpsEl) {
        // Get unique ERPs from filtered competitors
        const erpsSet = new Set();
        filteredCompetitors.forEach(competitor => {
            if (!competitor.erps) return;
            competitor.erps.forEach(erp => erpsSet.add(erp));
        });
        
        // Calculate average ERPs per competitor
        const avgErps = filteredCompetitors.length ? 
            (filteredCompetitors.reduce((sum, comp) => sum + (comp.erps ? comp.erps.length : 0), 0) / filteredCompetitors.length).toFixed(1) : 
            '0';
        
        // Update the statistics
        if (globalFilterState.isFilterActive) {
            const totalAllErps = document.getElementById('total-erps').getAttribute('data-original') || totalErpsEl.textContent;
            
            // Store original value if not stored yet
            if (!totalErpsEl.getAttribute('data-original')) {
                totalErpsEl.setAttribute('data-original', totalErpsEl.textContent);
            }
            
            totalErpsEl.textContent = `${erpsSet.size} / ${totalAllErps}`;
            
            // Store original value for avg ERPs if not stored yet
            if (!avgErpsEl.getAttribute('data-original')) {
                avgErpsEl.setAttribute('data-original', avgErpsEl.textContent);
            }
            
            avgErpsEl.textContent = avgErps;
        } else {
            // Restore original values if filter is not active
            if (totalErpsEl.getAttribute('data-original')) {
                totalErpsEl.textContent = totalErpsEl.getAttribute('data-original');
            }
            
            if (avgErpsEl.getAttribute('data-original')) {
                avgErpsEl.textContent = avgErpsEl.getAttribute('data-original');
            }
        }
    }
}

// Update Lead Magnet statistics with filtered data
function updateLeadMagnetStatistics(allCompetitors, filteredCompetitors) {
    const totalLeadMagnetsEl = document.getElementById('total-leadmagnets');
    const avgLeadMagnetsEl = document.getElementById('avg-leadmagnets');
    
    if (totalLeadMagnetsEl && avgLeadMagnetsEl) {
        // Get unique Lead Magnets from filtered competitors
        const leadMagnetsSet = new Set();
        filteredCompetitors.forEach(competitor => {
            if (!competitor.leadMagnets) return;
            competitor.leadMagnets.forEach(leadMagnet => leadMagnetsSet.add(leadMagnet));
        });
        
        // Calculate average Lead Magnets per competitor
        const avgLeadMagnets = filteredCompetitors.length ? 
            (filteredCompetitors.reduce((sum, comp) => sum + (comp.leadMagnets ? comp.leadMagnets.length : 0), 0) / filteredCompetitors.length).toFixed(1) : 
            '0';
        
        // Update the statistics
        if (globalFilterState.isFilterActive) {
            const totalAllLeadMagnets = document.getElementById('total-leadmagnets').getAttribute('data-original') || totalLeadMagnetsEl.textContent;
            
            // Store original value if not stored yet
            if (!totalLeadMagnetsEl.getAttribute('data-original')) {
                totalLeadMagnetsEl.setAttribute('data-original', totalLeadMagnetsEl.textContent);
            }
            
            totalLeadMagnetsEl.textContent = `${leadMagnetsSet.size} / ${totalAllLeadMagnets}`;
            
            // Store original value for avg Lead Magnets if not stored yet
            if (!avgLeadMagnetsEl.getAttribute('data-original')) {
                avgLeadMagnetsEl.setAttribute('data-original', avgLeadMagnetsEl.textContent);
            }
            
            avgLeadMagnetsEl.textContent = avgLeadMagnets;
        } else {
            // Restore original values if filter is not active
            if (totalLeadMagnetsEl.getAttribute('data-original')) {
                totalLeadMagnetsEl.textContent = totalLeadMagnetsEl.getAttribute('data-original');
            }
            
            if (avgLeadMagnetsEl.getAttribute('data-original')) {
                avgLeadMagnetsEl.textContent = avgLeadMagnetsEl.getAttribute('data-original');
            }
        }
    }
}

// Update visualizations with filtered data
function updateVisualizations(allCompetitors, filteredCompetitors) {
    // For now, we'll just regenerate the visualizations with filtered data
    // In a real implementation, we might update the existing visualizations more efficiently
    
    // This would typically call functions in features.js, erps.js, etc.
    // For simplicity, we'll just trigger a reload of the visualizations
    if (typeof generateFeatureHeatmap === 'function') {
        // Get all feature names
        const features = [];
        filteredCompetitors.forEach(competitor => {
            if (!competitor.features) return;
            competitor.features.forEach(feature => {
                if (!features.includes(feature)) {
                    features.push(feature);
                }
            });
        });
        
        // Generate heatmap with filtered competitors
        generateFeatureHeatmap(filteredCompetitors, features);
    }
}

// Initialize global filters when the page fully loads (not just DOM ready)
window.addEventListener('load', function() {
    console.log("Window fully loaded, initializing global filters");
    setTimeout(function() {
        initializeGlobalFilters();
    }, 500); // Add a small delay to ensure everything is ready
});

// Remove the DOMContentLoaded handler to avoid double initialization
// document.addEventListener('DOMContentLoaded', function() {
//     initializeGlobalFilters();
// });
