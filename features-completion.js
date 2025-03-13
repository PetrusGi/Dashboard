// This file contains the completion of the renderFeatures function and event listener
// that were truncated in features.js

// Completion of renderFeatures function
function renderFeaturesCompletion(features) {
    console.log("Rendering features...", features && features.length);
    
    const featureList = document.getElementById('feature-list');
    if (!featureList) {
        console.error("Feature list container not found");
        return;
    }
    
    featureList.innerHTML = '';
    
    if (!features || !Array.isArray(features) || features.length === 0) {
        featureList.innerHTML = '<div class="empty-state">No features available</div>';
        return;
    }
    
    // Get competitor data to count usage and analyze
    fetchData('competitors.json')
        .then(competitors => {
            if (!competitors || !Array.isArray(competitors)) {
                console.error("Invalid competitors data");
                return;
            }
            
            try {
                // Count feature usage
                const featureCounts = {};
                competitors.forEach(competitor => {
                    if (!competitor || !competitor.features || !Array.isArray(competitor.features)) return;
                    
                    competitor.features.forEach(feature => {
                        if (feature) {
                            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                        }
                    });
                });
                
                // Calculate feature adoption rates
                const featureAdoption = {};
                features.forEach(feature => {
                    if (feature) {
                        const featureName = typeof feature === 'object' ? feature.name : feature;
                        featureAdoption[featureName] = Math.round(((featureCounts[featureName] || 0) / competitors.length) * 100);
                    }
                });
                
                // Calculate average features per competitor
                const totalFeatures = features.length;
                const validCompetitors = competitors.filter(comp => comp && comp.features && Array.isArray(comp.features));
                const avgFeatures = validCompetitors.length ? 
                    (validCompetitors.reduce((sum, comp) => sum + comp.features.length, 0) / validCompetitors.length).toFixed(1) : 
                    '0';
                
                // Get feature categories
                const categories = [...new Set(features.map(f => 
                    typeof f === 'object' && f.category ? f.category : 'Misc'
                ))];
                
                // Update stats
                const totalFeaturesEl = document.getElementById('total-features');
                const avgFeaturesEl = document.getElementById('avg-features');
                
                if (totalFeaturesEl) totalFeaturesEl.textContent = totalFeatures;
                if (avgFeaturesEl) avgFeaturesEl.textContent = avgFeatures;
                
                // Find the competitor with the most features (Feature Leader)
                const leader = getFeatureLeader(competitors);
                
                // Get feature names array for compatibility with existing functions
                const featureNames = features.map(f => typeof f === 'object' ? f.name : f);
                
                // Find unique features
                const uniqueFeatures = findUniqueFeatures(competitors, featureNames);
                
                // Calculate market standard features
                const marketStandard = calculateMarketStandard(competitors, featureNames);
                
                // Find feature clusters
                const featureClusters = findFeatureClusters(competitors, featureNames);
                
                // Reorganize dashboard stats for layout
                const dashboardStats = document.querySelector('.dashboard-stats');
                if (dashboardStats) {
                    dashboardStats.innerHTML = `
                        <div class="stat-card">
                            <h4>Market Standard Features</h4>
                            <ul id="market-standard-list" class="stats-list"></ul>
                        </div>
                        <div class="stat-card">
                            <h4>Unique Features</h4>
                            <ul id="unique-features-list" class="stats-list"></ul>
                        </div>
                        <div class="stat-card" id="feature-leader-card">
                            <h4>Feature Leader</h4>
                            <div class="leader-content">
                                ${leader ? `
                                <div class="leader-info">
                                    <span class="leader-name">${leader.name}</span>
                                    <span class="leader-country">${leader.country}</span>
                                </div>
                                <div class="leader-stats">
                                    <span class="leader-count">${leader.count}</span>
                                    <span class="leader-label">Features Implemented</span>
                                </div>
                                ` : '<p>No leader found</p>'}
                            </div>
                        </div>
                        <div class="stat-card">
                            <h4>Feature Usage Stats</h4>
                            <div id="feature-stats-container" class="stats-content">
                                <p><strong>Total Features:</strong> <span id="total-features">${totalFeatures}</span></p>
                                <p><strong>Average Features per Competitor:</strong> <span id="avg-features">${avgFeatures}</span></p>
                            </div>
                        </div>
                    `;
                }
                
                // Reorganize the visualizations container
                const visualizationsContainer = document.querySelector('.visualizations-container');
                if (visualizationsContainer) {
                    visualizationsContainer.innerHTML = `
                        <div class="visualization-card full-width">
                            <h4>Feature Distribution Heatmap</h4>
                            <div id="feature-heatmap" class="chart-container">
                                <!-- Heatmap will be dynamically generated -->
                            </div>
                        </div>
                    `;
                }
                
                // Render market standard features
                const marketStandardList = document.getElementById('market-standard-list');
                if (marketStandardList) {
                    marketStandardList.innerHTML = '';
                    marketStandard.slice(0, 5).forEach(feature => {
                        const li = document.createElement('li');
                        li.innerHTML = `${feature.name} <span class="adoption">${feature.adoption}% adoption</span>`;
                        marketStandardList.appendChild(li);
                    });
                }
                
                // Render unique features
                const uniqueFeaturesList = document.getElementById('unique-features-list');
                if (uniqueFeaturesList) {
                    uniqueFeaturesList.innerHTML = '';
                    uniqueFeatures.slice(0, 5).forEach(feature => {
                        const li = document.createElement('li');
                        li.innerHTML = `${feature.name} <span class="exclusive">Only in ${feature.competitor}</span>`;
                        uniqueFeaturesList.appendChild(li);
                    });
                }
                
                // Reorganize the list header to include search and add button
                const listHeader = document.querySelector('.list-header');
                if (listHeader) {
                    // Keep the original "All Features" title
                    const title = listHeader.querySelector('h4').outerHTML;
                    
                    // Recreate the header with search and add button
                    listHeader.innerHTML = `
                        ${title}
                        <div class="list-header-actions">
                            <input type="text" id="feature-search" placeholder="Search features...">
                            <button id="add-feature-btn" class="action-btn">Add Feature</button>
                        </div>
                    `;
                    
                    // Setup search functionality
                    const searchInput = document.getElementById('feature-search');
                    if (searchInput) {
                        searchInput.addEventListener('input', () => {
                            const searchTerm = searchInput.value.toLowerCase();
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
                    
                    // Setup add feature button
                    const addFeatureBtn = document.getElementById('add-feature-btn');
                    if (addFeatureBtn) {
                        addFeatureBtn.addEventListener('click', () => {
                            addNewFeature();
                        });
                    }
                }
                
                // Remove search and add button from tab header if they exist
                const tabActions = document.querySelector('.tab-actions');
                if (tabActions) {
                    const featureSearch = tabActions.querySelector('#feature-search');
                    const addFeatureButton = tabActions.querySelector('#add-feature-btn');
                    
                    if (featureSearch) featureSearch.remove();
                    if (addFeatureButton) addFeatureButton.remove();
                    
                    // If tab actions is now empty, hide it
                    if (tabActions.children.length === 0) {
                        tabActions.style.display = 'none';
                    }
                }
                
                // Try to generate visualizations
                try {
                    // Generate a feature heatmap with scrollable container
                    generateFeatureHeatmap(competitors, featureNames);
                } catch (error) {
                    console.error("Error generating heatmap:", error);
                    const heatmapContainer = document.getElementById('feature-heatmap');
                    if (heatmapContainer) {
                        heatmapContainer.innerHTML = '<div class="visualization-error">Could not generate heatmap visualization</div>';
                    }
                }
                
                // Remove any existing filter sections first
                const existingFilterHeader = document.querySelector('.filter-header');
                if (existingFilterHeader) existingFilterHeader.remove();
                
                const existingFilterContainer = document.getElementById('feature-filters');
                if (existingFilterContainer) existingFilterContainer.remove();
                
                // Create filter toggle button and filter section
                const filterSection = document.createElement('div');
                filterSection.className = 'filter-header';
                filterSection.innerHTML = `
                    <h4>Filters</h4>
                    <button id="filter-toggle-btn" class="filter-toggle-btn">
                        <span class="material-icons filter-icon">filter_list</span>
                    </button>
                `;
                
                const filterContainer = document.createElement('div');
                filterContainer.id = 'feature-filters';
                filterContainer.className = 'filter-container feature-filters';
                filterContainer.style.display = 'none'; // Hidden by default
                
                // Add filter section before the list
                const listContainer = document.querySelector('.list-container');
                if (listContainer) {
                    listContainer.parentNode.insertBefore(filterSection, listContainer);
                    listContainer.parentNode.insertBefore(filterContainer, listContainer);
                    
                    // Setup feature category filter in the hidden container
                    setupFeatureCategoryFilter(categories, filterContainer);
                    
                    // Setup filter toggle button (after elements are added to DOM)
                    const filterToggleBtn = document.getElementById('filter-toggle-btn');
                    if (filterToggleBtn) {
                        filterToggleBtn.addEventListener('click', function() {
                            console.log("Filter button clicked");
                            if (filterContainer.style.display === 'none') {
                                filterContainer.style.display = 'flex';
                                this.classList.add('active');
                            } else {
                                filterContainer.style.display = 'none';
                                this.classList.remove('active');
                            }
                        });
                    }
                }
                
                // Render all features with category tags and adoption rate
                features.forEach(feature => {
                    if (!feature) return;
                    
                    const featureName = typeof feature === 'object' ? feature.name : feature;
                    const featureId = typeof feature === 'object' ? feature.id : `feature_${Math.random().toString(36).substr(2, 9)}`;
                    const category = typeof feature === 'object' && feature.category ? feature.category : 'Misc';
                    
                    const count = featureCounts[featureName] || 0;
                    const adoption = featureAdoption[featureName];
                    const isUnique = uniqueFeatures.some(f => f.name === featureName);
                    const isStandard = marketStandard.some(f => f.name === featureName);
                    
                    const featureItem = document.createElement('div');
                    featureItem.className = 'list-item feature-item';
                    featureItem.dataset.category = category;
                    featureItem.dataset.adoption = adoption;
                    featureItem.dataset.unique = isUnique;
                    featureItem.dataset.standard = isStandard;
                    
                    featureItem.innerHTML = `
                        <span class="list-item-name">${featureName}</span>
                        <div class="feature-meta">
                            <span class="feature-category" title="Category">${category}</span>
                            <span class="feature-adoption" title="Adoption rate">${adoption}%</span>
                            ${isUnique ? '<span class="feature-unique" title="Unique feature">Unique</span>' : ''}
                            ${isStandard ? '<span class="feature-standard" title="Market standard">Standard</span>' : ''}
                        </div>
                        <span class="list-item-count">${count}</span>
                        <div class="list-item-actions">
                            <button title="Edit" class="edit-feature-btn" data-feature-id="${featureId}">
                                <span class="material-icons">edit</span>
                            </button>
                            <button title="Delete" class="delete-feature-btn" data-feature-id="${featureId}">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    `;
                    featureList.appendChild(featureItem);
                    
                    // Add event listeners for edit and delete
                    const editBtn = featureItem.querySelector('.edit-feature-btn');
                    const deleteBtn = featureItem.querySelector('.delete-feature-btn');
                    
                    if (editBtn) {
                        editBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            editFeature(typeof feature === 'object' ? feature : { id: featureId, name: featureName, category });
                        });
                    }
                    
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteFeature(typeof feature === 'object' ? feature : { id: featureId, name: featureName });
                        });
                    }
                });
                
                // Add event listeners for category and adoption filters
                setTimeout(() => {
                    const filters = document.querySelectorAll('.category-filter, .adoption-filter, .special-filter');
                    if (filters.length > 0) {
                        filters.forEach(filter => {
                            filter.removeEventListener('change', filterFeatures);
                            filter.addEventListener('change', filterFeatures);
                        });
                    }
                }, 100);
                
                // Add CSS for the scrollable heatmap and feature modals
                const styleId = 'feature-management-styles';
                if (!document.getElementById(styleId)) {
                    const style = document.createElement('style');
                    style.id = styleId;
                    style.textContent = `
                        /* Filter toggle button */
                        .filter-toggle-btn {
                            background: none;
                            border: none;
                            cursor: pointer;
                            color: var(--primary-color);
                            transition: var(--transition);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 5px;
                            border-radius: 50%;
                        }
                        
                        .filter-toggle-btn:hover, .filter-toggle-btn.active {
                            background-color: var(--secondary-color);
                            transform: scale(1.1);
                        }
                        
                        .filter-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                        }
                        
                        /* Heatmap styles with scrolling */
                        .heatmap-scrollable-container {
                            width: 100%;
                            overflow-x: auto;
                            max-height: 400px;
                            overflow-y: auto;
                            border: 1px solid var(--secondary-color);
                            border-radius: 8px;
                        }
                        
                        .heatmap-table th {
                            position: sticky;
                            top: 0;
                            z-index: 1;
                            background-color: #f5f5f5;
                        }
                        
                        .heatmap-table th:first-child,
                        .heatmap-table td:first-child {
                            position: sticky;
                            left: 0;
                            z-index: 2;
                            background-color: #f5f5f5;
                        }
                        
                        .heatmap-table th:first-child {
                            z-index: 3;
                        }
                        
                        /* Feature Modal Styles */
                        .feature-edit-modal {
                            display: none;
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0,0,0,0.5);
                            z-index: 1000;
                            overflow-y: auto;
                        }
                        
                        .feature-edit-modal .modal-content {
                            background-color: var(--white);
                            margin: 50px auto;
                            padding: 30px;
                            border-radius: 16px;
                            box-shadow: var(--shadow);
                            max-width: 600px;
                            width: 90%;
                            position: relative;
                        }
                        
                        .edit-form {
                            margin-top: 20px;
                        }
                        
                        .feature-edit-modal .form-actions {
                            display: flex;
                            justify-content: flex-end;
                            gap: 10px;
                            margin-top: 20px;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
            } catch (error) {
                console.error("Error rendering features:", error);
                featureList.innerHTML = `<div class="error-state">Error rendering features: ${error.message}</div>`;
            }
        })
        .catch(error => {
            console.error("Error fetching competitors data:", error);
            featureList.innerHTML = `<div class="error-state">Error loading competitors data: ${error.message}</div>`;
        });
}

// Add event listener to initialize data and setup additional event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Override the renderFeatures function with our complete version
    window.renderFeatures = renderFeaturesCompletion;
    
    // Add event listener for add feature button
    const addFeatureBtn = document.getElementById('add-feature-btn');
    if (addFeatureBtn) {
        addFeatureBtn.removeEventListener('click', addNewFeature);
        addFeatureBtn.addEventListener('click', addNewFeature);
    }
});
