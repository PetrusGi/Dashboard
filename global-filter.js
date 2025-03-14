// global-filter.js - Complete global filtering functionality

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
            
            // Make sure the filter is set to "all" on startup
            console.log("Setting global filter state to 'all' on startup");
            
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
    
    // Toggle dropdown visibility with the button
    filterBtn.addEventListener('click', function(e) {
        console.log("Filter button clicked");
        e.stopPropagation();
        dropdown.classList.toggle('show');
        console.log("Dropdown visibility toggled:", dropdown.classList.contains('show'));
    });
    
    // Add event handler for the "All Countries" checkbox
    const allCheckbox = dropdown.querySelector('.country-filter[value="all"]');
    if (allCheckbox) {
        allCheckbox.addEventListener('change', () => {
            console.log("All Countries checkbox changed:", allCheckbox.checked);
            
            // Update all other checkboxes
            const countryCheckboxes = document.querySelectorAll('.country-filter:not([value="all"])');
            countryCheckboxes.forEach(cb => {
                cb.checked = allCheckbox.checked;
            });
            
            // Update global filter state
            globalFilterState.allCountriesSelected = allCheckbox.checked;
            
            // Update the filter state
            updateGlobalFilterState();
            
            // Apply global filtering
            applyGlobalFilters();
        });
    }
    
    // Add event handlers for country checkboxes
    const countryCheckboxes = document.querySelectorAll('.country-filter:not([value="all"])');
    countryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            console.log("Country checkbox changed:", checkbox.value, checkbox.checked);
            
            // Update the "All Countries" checkbox
            const allCheckbox = document.querySelector('.country-filter[value="all"]');
            const countryChecks = Array.from(document.querySelectorAll('.country-filter:not([value="all"])'));
            const allChecked = countryChecks.every(cb => cb.checked);
            
            if (allCheckbox) {
                allCheckbox.checked = allChecked;
            }
            globalFilterState.allCountriesSelected = allChecked;
            
            // Update the filter state
            updateGlobalFilterState();
            
            // Apply global filtering
            applyGlobalFilters();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== filterBtn) {
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
    
    // Check if any country checkboxes are checked (excluding "all")
    const countryChecks = Array.from(document.querySelectorAll('.country-filter:not([value="all"])'));
    const anyChecked = countryChecks.some(cb => cb.checked);
    
    globalFilterState.countries = selectedCountries;
    globalFilterState.allCountriesSelected = allSelected;
    globalFilterState.isFilterActive = !allSelected;
    
    // If no countries are selected, we should still apply filtering
    if (!anyChecked) {
        console.log("No countries selected, showing no competitors");
        globalFilterState.countries = [];
        globalFilterState.isFilterActive = true;
    }
    
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
            // If no countries are selected, use an empty array for filteredCompetitors
            let filteredCompetitors;
            
            if (globalFilterState.countries.length === 0) {
                // No countries selected, show no competitors
                filteredCompetitors = [];
            } else {
                // Filter competitors based on selected countries
                filteredCompetitors = competitors.filter(comp => 
                    globalFilterState.countries.includes(comp.country)
                );
            }
            
            // Apply filters to all content
            filterAllContent(competitors, filteredCompetitors);
            
            // Update statistics and visualizations
            updateStatisticsWithFilter(competitors, filteredCompetitors);
        })
        .catch(error => {
            console.error('Error applying global filters:', error);
        });
}

// Filter all content based on filtered competitors
function filterAllContent(allCompetitors, filteredCompetitors) {
    // Filter competitor cards
    filterCompetitorCards(allCompetitors, filteredCompetitors);
    
    // Filter features list
    filterFeaturesList(allCompetitors, filteredCompetitors);
    
    // Filter ERPs list
    filterErpsList(allCompetitors, filteredCompetitors);
    
    // Filter Lead Magnets list
    filterLeadMagnetsList(allCompetitors, filteredCompetitors);
    
    // Filter pricing sections
    filterPricingSections(allCompetitors, filteredCompetitors);
    
    // Instead of re-rendering the tabs, we'll directly update the stat cards
    
    // Update Feature Leader card
    updateFeatureLeaderCard(allCompetitors, filteredCompetitors);
    
    // Update Market Standard Features list
    updateMarketStandardList(allCompetitors, filteredCompetitors);
    
    // Update Unique Features list
    updateUniqueFeaturesList(allCompetitors, filteredCompetitors);
    
    // Update ERP Leader card
    updateERPLeaderCard(allCompetitors, filteredCompetitors);
    
    // Update Market Standard ERPs list
    updateMarketStandardERPsList(allCompetitors, filteredCompetitors);
    
    // Update Unique ERPs list
    updateUniqueERPsList(allCompetitors, filteredCompetitors);
    
    // Update Lead Magnet Leader card
    updateLeadMagnetLeaderCard(allCompetitors, filteredCompetitors);
    
    // Update Market Standard Lead Magnets list
    updateMarketStandardLeadMagnetsList(allCompetitors, filteredCompetitors);
    
    // Update Unique Lead Magnets list
    updateUniqueLeadMagnetsList(allCompetitors, filteredCompetitors);
    
    // Filter all elements with data-country attribute
    document.querySelectorAll('[data-country]').forEach(element => {
        const country = element.dataset.country;
        
        if (!globalFilterState.countries.includes(country)) {
            element.classList.add('country-hidden');
        } else {
            element.classList.remove('country-hidden');
        }
    });
    
    // Filter all elements with data-competitor-id attribute
    document.querySelectorAll('[data-competitor-id]').forEach(element => {
        const competitorId = element.dataset.competitorId;
        const competitor = allCompetitors.find(comp => comp.id === competitorId);
        
        if (competitor && !globalFilterState.countries.includes(competitor.country)) {
            element.classList.add('country-hidden');
        } else {
            element.classList.remove('country-hidden');
        }
    });
    
    // Filter all elements with data-id attribute (competitor cards)
    document.querySelectorAll('[data-id]').forEach(element => {
        const competitorId = element.dataset.id;
        const competitor = allCompetitors.find(comp => comp.id === competitorId);
        
        if (competitor && !globalFilterState.countries.includes(competitor.country)) {
            element.classList.add('country-hidden');
        } else {
            element.classList.remove('country-hidden');
        }
    });
    
    // If no countries are selected, update all stat cards to show "No data"
    if (globalFilterState.countries.length === 0) {
        // Hide all competitor cards
        document.querySelectorAll('.competitor-card').forEach(card => {
            card.classList.add('country-hidden');
        });
        
        // Hide all pricing sections
        document.querySelectorAll('.pricing-section').forEach(section => {
            section.classList.add('country-hidden');
        });
        
        // Update stat lists to show "No data"
        ['market-standard-list', 'unique-features-list', 'top-features-list', 
         'top-erps-list', 'least-erps-list', 
         'top-leadmagnets-list', 'least-leadmagnets-list'].forEach(listId => {
            const list = document.getElementById(listId);
            if (list) {
                list.innerHTML = '<li class="empty-item">No data available</li>';
            }
        });
        
        // Update leader cards
        const leaderCards = document.querySelectorAll('.leader-content');
        leaderCards.forEach(card => {
            card.innerHTML = '<p>No data available</p>';
        });
        
        // Update stat counters to show "0"
        ['total-features', 'avg-features', 'total-erps', 'avg-erps', 
         'total-leadmagnets', 'avg-leadmagnets'].forEach(statId => {
            const stat = document.getElementById(statId);
            if (stat) {
                // Store original value if not already stored
                if (!stat.getAttribute('data-original')) {
                    stat.setAttribute('data-original', stat.textContent);
                }
                stat.textContent = '0';
            }
        });
    } else {
        // Restore original values if they were stored
        ['total-features', 'avg-features', 'total-erps', 'avg-erps', 
         'total-leadmagnets', 'avg-leadmagnets'].forEach(statId => {
            const stat = document.getElementById(statId);
            if (stat && stat.getAttribute('data-original') && !globalFilterState.isFilterActive) {
                stat.textContent = stat.getAttribute('data-original');
            }
        });
    }
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
        if (!competitor.features) return;
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

// Update Feature Leader card
function updateFeatureLeaderCard(allCompetitors, filteredCompetitors) {
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
    } else if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        const leaderContent = leaderCard.querySelector('.leader-content');
        if (leaderContent) {
            leaderContent.innerHTML = '<p>No data available</p>';
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

// Update Market Standard Features list
function updateMarketStandardList(allCompetitors, filteredCompetitors) {
    const marketStandardList = document.getElementById('market-standard-list');
    if (!marketStandardList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        marketStandardList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all feature names
        fetchData('features.json')
            .then(features => {
                const featureNames = features.map(f => typeof f === 'object' ? f.name : f);
                
                // Calculate market standard features based on filtered competitors
                const marketStandard = calculateMarketStandard(filteredCompetitors, featureNames);
                
                // Update the list
                marketStandardList.innerHTML = '';
                if (marketStandard.length === 0) {
                    marketStandardList.innerHTML = '<li class="empty-item">No market standard features found</li>';
                    return;
                }
                
                marketStandard.slice(0, 5).forEach(feature => {
                    const li = document.createElement('li');
                    li.innerHTML = `${feature.name} <span class="adoption">${feature.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            });
    }
}

// Calculate market standard features
function calculateMarketStandard(competitors, allFeatures) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allFeatures || !Array.isArray(allFeatures) || allFeatures.length === 0) {
        return [];
    }
    
    const featuresMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.features && Array.isArray(comp.features));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all features
    allFeatures.forEach(feature => {
        if (feature) {
            featuresMap[feature] = 0;
        }
    });
    
    // Count feature usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            if (feature && featuresMap[feature] !== undefined) {
                featuresMap[feature] += 1;
            }
        });
    });
    
    // Filter for market standard features
    const standardFeatures = allFeatures.filter(feature => 
        feature && featuresMap[feature] >= threshold
    ).map(feature => ({
        name: feature,
        adoption: Math.round((featuresMap[feature] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardFeatures.length < 3 && allFeatures.length > 0) {
        // If we don't have enough standard features, add the most common ones
        const topFeatures = [...allFeatures]
            .filter(f => f && !standardFeatures.some(sf => sf.name === f))
            .sort((a, b) => (featuresMap[b] || 0) - (featuresMap[a] || 0))
            .slice(0, 5 - standardFeatures.length)
            .map(feature => ({
                name: feature,
                adoption: Math.round((featuresMap[feature] / validCompetitors.length) * 100)
            }));
        
        return [...standardFeatures, ...topFeatures].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardFeatures.sort((a, b) => b.adoption - a.adoption);
}

// Update Unique Features list
function updateUniqueFeaturesList(allCompetitors, filteredCompetitors) {
    const uniqueFeaturesList = document.getElementById('unique-features-list');
    if (!uniqueFeaturesList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        uniqueFeaturesList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all feature names
        fetchData('features.json')
            .then(features => {
                const featureNames = features.map(f => typeof f === 'object' ? f.name : f);
                
                // Find unique features based on filtered competitors
                const uniqueFeatures = findUniqueFeatures(filteredCompetitors, featureNames);
                
                // Update the list
                uniqueFeaturesList.innerHTML = '';
                if (uniqueFeatures.length === 0) {
                    uniqueFeaturesList.innerHTML = '<li class="empty-item">No unique features found</li>';
                    return;
                }
                
                uniqueFeatures.slice(0, 5).forEach(feature => {
                    const li = document.createElement('li');
                    li.innerHTML = `${feature.name} <span class="exclusive">Only in ${feature.competitor}</span>`;
                    uniqueFeaturesList.appendChild(li);
                });
            });
    }
}

// Find unique features
function findUniqueFeatures(competitors, allFeatures) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allFeatures || !Array.isArray(allFeatures) || allFeatures.length === 0) {
        return [];
    }
    
    const featuresMap = {};
    
    // Initialize count for all features
    allFeatures.forEach(feature => {
        if (feature) {
            featuresMap[feature] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count feature usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.features || !Array.isArray(competitor.features)) {
            return; // Skip invalid competitors
        }
        
        competitor.features.forEach(feature => {
            if (feature && featuresMap[feature]) {
                featuresMap[feature].count += 1;
                if (featuresMap[feature].count === 1) {
                    featuresMap[feature].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique features
    const uniqueFeatures = allFeatures.filter(feature => 
        feature && featuresMap[feature] && featuresMap[feature].count === 1
    ).map(feature => ({
        name: feature,
        competitor: featuresMap[feature].competitor
    }));
    
    return uniqueFeatures;
}

// Update ERP Leader card
function updateERPLeaderCard(allCompetitors, filteredCompetitors) {
    const leaderCard = document.getElementById('erp-leader-card');
    if (!leaderCard) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        const leaderContent = leaderCard.querySelector('.leader-content');
        if (leaderContent) {
            leaderContent.innerHTML = '<p>No data available</p>';
        }
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Find the competitor with the most ERPs
        let maxERPs = 0;
        let leader = null;
        
        filteredCompetitors.forEach(competitor => {
            if (competitor.erps && competitor.erps.length > maxERPs) {
                maxERPs = competitor.erps.length;
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
                        <span class="leader-count">${maxERPs}</span>
                        <span class="leader-label">ERPs Integrated</span>
                    </div>
                `;
            }
        }
    }
}

// Update Market Standard ERPs list
function updateMarketStandardERPsList(allCompetitors, filteredCompetitors) {
    const marketStandardList = document.getElementById('market-standard-erps-list');
    if (!marketStandardList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        marketStandardList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all ERP names
        fetchData('erps.json')
            .then(erps => {
                // Calculate market standard ERPs based on filtered competitors
                const marketStandard = calculateMarketStandardERPs(filteredCompetitors, erps);
                
                // Update the list
                marketStandardList.innerHTML = '';
                if (marketStandard.length === 0) {
                    marketStandardList.innerHTML = '<li class="empty-item">No market standard ERPs found</li>';
                    return;
                }
                
                marketStandard.slice(0, 5).forEach(erp => {
                    const li = document.createElement('li');
                    li.innerHTML = `${erp.name} <span class="adoption">${erp.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            });
    }
}

// Calculate market standard ERPs
function calculateMarketStandardERPs(competitors, allERPs) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allERPs || !Array.isArray(allERPs) || allERPs.length === 0) {
        return [];
    }
    
    const erpsMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.erps && Array.isArray(comp.erps));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all ERPs
    allERPs.forEach(erp => {
        if (erp) {
            erpsMap[erp] = 0;
        }
    });
    
    // Count ERP usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.erps.forEach(erp => {
            if (erp && erpsMap[erp] !== undefined) {
                erpsMap[erp] += 1;
            }
        });
    });
    
    // Filter for market standard ERPs
    const standardERPs = allERPs.filter(erp => 
        erp && erpsMap[erp] >= threshold
    ).map(erp => ({
        name: erp,
        adoption: Math.round((erpsMap[erp] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardERPs.length < 3 && allERPs.length > 0) {
        // If we don't have enough standard ERPs, add the most common ones
        const topERPs = [...allERPs]
            .filter(e => e && !standardERPs.some(s => s.name === e))
            .sort((a, b) => (erpsMap[b] || 0) - (erpsMap[a] || 0))
            .slice(0, 5 - standardERPs.length)
            .map(erp => ({
                name: erp,
                adoption: Math.round((erpsMap[erp] / validCompetitors.length) * 100)
            }));
        
        return [...standardERPs, ...topERPs].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardERPs.sort((a, b) => b.adoption - a.adoption);
}

// Update Unique ERPs list
function updateUniqueERPsList(allCompetitors, filteredCompetitors) {
    const uniqueERPsList = document.getElementById('unique-erps-list');
    if (!uniqueERPsList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        uniqueERPsList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all ERP names
        fetchData('erps.json')
            .then(erps => {
                // Find unique ERPs based on filtered competitors
                const uniqueERPs = findUniqueERPs(filteredCompetitors, erps);
                
                // Update the list
                uniqueERPsList.innerHTML = '';
                if (uniqueERPs.length === 0) {
                    uniqueERPsList.innerHTML = '<li class="empty-item">No unique ERPs found</li>';
                    return;
                }
                
                uniqueERPs.slice(0, 5).forEach(erp => {
                    const li = document.createElement('li');
                    li.innerHTML = `${erp.name} <span class="exclusive">Only in ${erp.competitor}</span>`;
                    uniqueERPsList.appendChild(li);
                });
            });
    }
}

// Find unique ERPs
function findUniqueERPs(competitors, allERPs) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allERPs || !Array.isArray(allERPs) || allERPs.length === 0) {
        return [];
    }
    
    const erpsMap = {};
    
    // Initialize count for all ERPs
    allERPs.forEach(erp => {
        if (erp) {
            erpsMap[erp] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count ERP usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.erps || !Array.isArray(competitor.erps)) {
            return; // Skip invalid competitors
        }
        
        competitor.erps.forEach(erp => {
            if (erp && erpsMap[erp]) {
                erpsMap[erp].count += 1;
                if (erpsMap[erp].count === 1) {
                    erpsMap[erp].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique ERPs
    const uniqueERPs = allERPs.filter(erp => 
        erp && erpsMap[erp] && erpsMap[erp].count === 1
    ).map(erp => ({
        name: erp,
        competitor: erpsMap[erp].competitor
    }));
    
    return uniqueERPs;
}

// Update Lead Magnet Leader card
function updateLeadMagnetLeaderCard(allCompetitors, filteredCompetitors) {
    const leaderCard = document.getElementById('leadmagnet-leader-card');
    if (!leaderCard) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        const leaderContent = leaderCard.querySelector('.leader-content');
        if (leaderContent) {
            leaderContent.innerHTML = '<p>No data available</p>';
        }
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Find the competitor with the most Lead Magnets
        let maxLeadMagnets = 0;
        let leader = null;
        
        filteredCompetitors.forEach(competitor => {
            if (competitor.leadMagnets && competitor.leadMagnets.length > maxLeadMagnets) {
                maxLeadMagnets = competitor.leadMagnets.length;
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
                        <span class="leader-count">${maxLeadMagnets}</span>
                        <span class="leader-label">Lead Magnets Used</span>
                    </div>
                `;
            }
        }
    }
}

// Update Market Standard Lead Magnets list
function updateMarketStandardLeadMagnetsList(allCompetitors, filteredCompetitors) {
    const marketStandardList = document.getElementById('market-standard-leadmagnets-list');
    if (!marketStandardList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        marketStandardList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all Lead Magnet names
        fetchData('leadmagnets.json')
            .then(leadMagnets => {
                // Calculate market standard Lead Magnets based on filtered competitors
                const marketStandard = calculateMarketStandardLeadMagnets(filteredCompetitors, leadMagnets);
                
                // Update the list
                marketStandardList.innerHTML = '';
                if (marketStandard.length === 0) {
                    marketStandardList.innerHTML = '<li class="empty-item">No market standard lead magnets found</li>';
                    return;
                }
                
                marketStandard.slice(0, 5).forEach(leadMagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet.name} <span class="adoption">${leadMagnet.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            });
    }
}

// Calculate market standard Lead Magnets
function calculateMarketStandardLeadMagnets(competitors, allLeadMagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allLeadMagnets || !Array.isArray(allLeadMagnets) || allLeadMagnets.length === 0) {
        return [];
    }
    
    const leadMagnetsMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.leadMagnets && Array.isArray(comp.leadMagnets));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all Lead Magnets
    allLeadMagnets.forEach(leadMagnet => {
        if (leadMagnet) {
            leadMagnetsMap[leadMagnet] = 0;
        }
    });
    
    // Count Lead Magnet usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.leadMagnets.forEach(leadMagnet => {
            if (leadMagnet && leadMagnetsMap[leadMagnet] !== undefined) {
                leadMagnetsMap[leadMagnet] += 1;
            }
        });
    });
    
    // Filter for market standard Lead Magnets
    const standardLeadMagnets = allLeadMagnets.filter(leadMagnet => 
        leadMagnet && leadMagnetsMap[leadMagnet] >= threshold
    ).map(leadMagnet => ({
        name: leadMagnet,
        adoption: Math.round((leadMagnetsMap[leadMagnet] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardLeadMagnets.length < 3 && allLeadMagnets.length > 0) {
        // If we don't have enough standard Lead Magnets, add the most common ones
        const topLeadMagnets = [...allLeadMagnets]
            .filter(lm => lm && !standardLeadMagnets.some(s => s.name === lm))
            .sort((a, b) => (leadMagnetsMap[b] || 0) - (leadMagnetsMap[a] || 0))
            .slice(0, 5 - standardLeadMagnets.length)
            .map(leadMagnet => ({
                name: leadMagnet,
                adoption: Math.round((leadMagnetsMap[leadMagnet] / validCompetitors.length) * 100)
            }));
        
        return [...standardLeadMagnets, ...topLeadMagnets].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardLeadMagnets.sort((a, b) => b.adoption - a.adoption);
}

// Update Unique Lead Magnets list
function updateUniqueLeadMagnetsList(allCompetitors, filteredCompetitors) {
    const uniqueLeadMagnetsList = document.getElementById('unique-leadmagnets-list');
    if (!uniqueLeadMagnetsList) return;
    
    if (globalFilterState.countries.length === 0) {
        // No countries selected, show "No data available"
        uniqueLeadMagnetsList.innerHTML = '<li class="empty-item">No data available</li>';
        return;
    }
    
    if (globalFilterState.isFilterActive && filteredCompetitors.length > 0) {
        // Get all Lead Magnet names
        fetchData('leadmagnets.json')
            .then(leadMagnets => {
                // Find unique Lead Magnets based on filtered competitors
                const uniqueLeadMagnets = findUniqueLeadMagnets(filteredCompetitors, leadMagnets);
                
                // Update the list
                uniqueLeadMagnetsList.innerHTML = '';
                if (uniqueLeadMagnets.length === 0) {
                    uniqueLeadMagnetsList.innerHTML = '<li class="empty-item">No unique lead magnets found</li>';
                    return;
                }
                
                uniqueLeadMagnets.slice(0, 5).forEach(leadMagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet.name} <span class="exclusive">Only in ${leadMagnet.competitor}</span>`;
                    uniqueLeadMagnetsList.appendChild(li);
                });
            });
    }
}

// Find unique Lead Magnets
function findUniqueLeadMagnets(competitors, allLeadMagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allLeadMagnets || !Array.isArray(allLeadMagnets) || allLeadMagnets.length === 0) {
        return [];
    }
    
    const leadMagnetsMap = {};
    
    // Initialize count for all Lead Magnets
    allLeadMagnets.forEach(leadMagnet => {
        if (leadMagnet) {
            leadMagnetsMap[leadMagnet] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count Lead Magnet usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.leadMagnets || !Array.isArray(competitor.leadMagnets)) {
            return; // Skip invalid competitors
        }
        
        competitor.leadMagnets.forEach(leadMagnet => {
            if (leadMagnet && leadMagnetsMap[leadMagnet]) {
                leadMagnetsMap[leadMagnet].count += 1;
                if (leadMagnetsMap[leadMagnet].count === 1) {
                    leadMagnetsMap[leadMagnet].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique Lead Magnets
    const uniqueLeadMagnets = allLeadMagnets.filter(leadMagnet => 
        leadMagnet && leadMagnetsMap[leadMagnet] && leadMagnetsMap[leadMagnet].count === 1
    ).map(leadMagnet => ({
        name: leadMagnet,
        competitor: leadMagnetsMap[leadMagnet].competitor
    }));
    
    return uniqueLeadMagnets;
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

// Initialize global filters when the page fully loads (not just DOM ready)
window.addEventListener('load', function() {
    console.log("Window fully loaded, initializing global filters");
    setTimeout(function() {
        initializeGlobalFilters();
    }, 500); // Add a small delay to ensure everything is ready
});
