// Functions to add new items
function addNewFeature() {
    // Fetch all features to get current categories
    fetchData('features.json')
        .then(features => {
            // Get all existing categories
            const allCategories = [...new Set(features
                .filter(f => typeof f === 'object' && f.category)
                .map(f => f.category)
                .concat(['Misc'])
            )];
            
            // Create modal content for adding new feature
            const modalContent = `
                <h3>Add New Feature</h3>
                <div class="edit-form">
                    <div class="form-group">
                        <label for="feature-name-add">Feature Name</label>
                        <input type="text" id="feature-name-add" placeholder="Enter feature name" required>
                    </div>
                    <div class="form-group">
                        <label for="feature-category-select">Category</label>
                        <select id="feature-category-select">
                            <option value="">-- Select Category --</option>
                            ${allCategories.map(cat => `
                                <option value="${cat}">${cat}</option>
                            `).join('')}
                            <option value="new">+ Add New Category</option>
                        </select>
                    </div>
                    <div id="new-category-container" class="form-group" style="display: none;">
                        <label for="new-category-input">New Category Name</label>
                        <input type="text" id="new-category-input" placeholder="Enter new category name">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" onclick="closeFeatureModal()">Cancel</button>
                        <button type="button" class="save-btn" onclick="saveNewFeature()">Save</button>
                    </div>
                </div>
            `;
            
            // Show the modal with add form
            showFeatureModal(modalContent);
            
            // Add event listener for category select change
            document.getElementById('feature-category-select').addEventListener('change', function() {
                const newCategoryContainer = document.getElementById('new-category-container');
                if (this.value === 'new') {
                    newCategoryContainer.style.display = 'block';
                } else {
                    newCategoryContainer.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Error loading features:', error);
            alert('Failed to load features. Please try again.');
        });
}

// Function to save new feature
function saveNewFeature() {
    const name = document.getElementById('feature-name-add').value.trim();
    let category = document.getElementById('feature-category-select').value;
    
    // Check if user is creating a new category
    if (category === 'new') {
        category = document.getElementById('new-category-input').value.trim();
        if (!category) {
            alert('Please enter a category name or select an existing one.');
            return;
        }
    }
    
    if (!name) {
        alert('Feature name cannot be empty.');
        return;
    }
    
    // Add new feature to features.json
    fetchData('features.json')
        .then(features => {
            const featureNames = features.map(f => typeof f === 'object' ? f.name : f);
            
            // Check if feature already exists
            if (featureNames.includes(name)) {
                alert(`Feature "${name}" already exists.`);
                return;
            }
            
            // Create new feature object with ID
            const newFeature = {
                id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                name: name,
                category: category || 'Misc'
            };
            
            // Convert any string features to objects
            const updatedFeatures = features.map(f => 
                typeof f === 'string' ? { id: `feature_${Math.random().toString(36).substr(2, 9)}`, name: f, category: 'Misc' } : f
            );
            
            // Add new feature to list
            updatedFeatures.push(newFeature);
            
            // Save updated features list
            saveData('features.json', updatedFeatures)
                .then(() => {
                    closeFeatureModal();
                    initializeData();
                    alert(`Feature "${name}" added successfully.`);
                })
                .catch(error => {
                    console.error('Error saving feature:', error);
                    alert('Failed to add feature. Please try again.');
                });
        })
        .catch(error => {
            console.error('Error fetching features:', error);
            alert('Failed to fetch features. Please try again.');
        });
}

// Helper function to show feature modal
function showFeatureModal(content) {
    // Remove any existing modal
    const existingModal = document.querySelector('.feature-edit-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'feature-edit-modal modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeFeatureModal()">&times;</span>
            ${content}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Helper function to close feature modal
function closeFeatureModal() {
    const modal = document.querySelector('.feature-edit-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Function to edit a feature
function editFeature(feature) {
    const featureName = typeof feature === 'object' ? feature.name : feature;
    const featureId = typeof feature === 'object' ? feature.id : `feature_${Math.random().toString(36).substr(2, 9)}`;
    const featureCategory = typeof feature === 'object' ? feature.category : 'Misc';
    
    // Fetch all features to get the current categories
    fetchData('features.json')
        .then(features => {
            // Get all existing categories
            const allCategories = [...new Set(features
                .filter(f => typeof f === 'object' && f.category)
                .map(f => f.category)
                .concat(['Misc'])
            )];
            
            // Create modal content for editing
            const modalContent = `
                <h3>Edit Feature</h3>
                <div class="edit-form">
                    <div class="form-group">
                        <label for="feature-name-edit">Feature Name</label>
                        <input type="text" id="feature-name-edit" value="${featureName}" required>
                    </div>
                    <div class="form-group">
                        <label for="feature-category-select">Category</label>
                        <select id="feature-category-select">
                            <option value="">-- Select Category --</option>
                            ${allCategories.map(cat => `
                                <option value="${cat}" ${featureCategory === cat ? 'selected' : ''}>${cat}</option>
                            `).join('')}
                            <option value="new">+ Add New Category</option>
                        </select>
                    </div>
                    <div id="new-category-container" class="form-group" style="display: none;">
                        <label for="new-category-input">New Category Name</label>
                        <input type="text" id="new-category-input" placeholder="Enter new category name">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn" onclick="closeFeatureModal()">Cancel</button>
                        <button type="button" class="save-btn" onclick="saveFeatureEdit('${featureId}', '${featureName}')">Save</button>
                    </div>
                </div>
            `;
            
            // Show the modal with edit form
            showFeatureModal(modalContent);
            
            // Add event listener for category select change
            document.getElementById('feature-category-select').addEventListener('change', function() {
                const newCategoryContainer = document.getElementById('new-category-container');
                if (this.value === 'new') {
                    newCategoryContainer.style.display = 'block';
                } else {
                    newCategoryContainer.style.display = 'none';
                }
            });
        });
}

// Function to save feature edits
function saveFeatureEdit(featureId, oldName) {
    const newName = document.getElementById('feature-name-edit').value.trim();
    let category = document.getElementById('feature-category-select').value;
    
    // Check if user is creating a new category
    if (category === 'new') {
        category = document.getElementById('new-category-input').value.trim();
        if (!category) {
            alert('Please enter a category name or select an existing one.');
            return;
        }
    }
    
    if (!newName) {
        alert('Feature name cannot be empty.');
        return;
    }
    
    // Update feature in features.json
    fetchData('features.json')
        .then(features => {
            // Convert any string features to objects first
            let updatedFeatures = features.map(f => {
                if (typeof f === 'string') {
                    return { 
                        id: `feature_${Math.random().toString(36).substr(2, 9)}`, 
                        name: f, 
                        category: 'Misc' 
                    };
                }
                return f;
            });
            
            // Find the feature to update
            const feature = updatedFeatures.find(f => f.id === featureId || f.name === oldName);
            if (feature) {
                const oldFeatureName = feature.name;
                feature.name = newName;
                feature.category = category || 'Misc';
                
                // Save updated features list
                saveData('features.json', updatedFeatures)
                    .then(() => {
                        // Update feature name in competitors if name changed
                        if (oldFeatureName !== newName) {
                            updateCompetitorItems('competitors.json', 'features', oldFeatureName, newName)
                                .then(() => {
                                    closeFeatureModal();
                                    initializeData();
                                    alert(`Feature updated successfully.`);
                                });
                        } else {
                            closeFeatureModal();
                            initializeData();
                            alert(`Feature updated successfully.`);
                        }
                    })
                    .catch(error => {
                        console.error('Error saving feature:', error);
                        alert('Failed to update feature. Please try again.');
                    });
            } else {
                alert(`Feature not found.`);
            }
        });
}

// Function to delete a feature
function deleteFeature(feature) {
    const featureName = typeof feature === 'object' ? feature.name : feature;
    const featureId = typeof feature === 'object' ? feature.id : null;
    
    if (confirm(`Are you sure you want to delete the feature: ${featureName}?`)) {
        // Delete the feature from the database
        fetchData('features.json')
            .then(features => {
                let index;
                if (featureId) {
                    index = features.findIndex(f => typeof f === 'object' && f.id === featureId);
                } else {
                    index = features.findIndex(f => {
                        return typeof f === 'object' ? f.name === featureName : f === featureName;
                    });
                }
                
                if (index === -1) {
                    alert(`Feature not found: ${featureName}`);
                    return;
                }
                
                // Remove the feature
                features.splice(index, 1);
                
                // Save updated features list
                saveData('features.json', features)
                    .then(() => {
                        // Remove the feature from all competitors
                        removeItemFromCompetitors('competitors.json', 'features', featureName)
                            .then(() => {
                                // Refresh the data
                                initializeData();
                                alert(`Feature deleted: ${featureName}`);
                            });
                    })
                    .catch(error => {
                        console.error('Error deleting feature:', error);
                        alert('Failed to delete feature. Please try again.');
                    });
            });
    }
}

// Calculate which competitor has implemented the most features
function getFeatureLeader(competitors) {
    if (!competitors || competitors.length === 0) return null;
    
    let maxFeatures = 0;
    let leader = null;
    
    competitors.forEach(competitor => {
        if (!competitor.features || !Array.isArray(competitor.features)) {
            return; // Skip if features is not an array
        }
        
        if (competitor.features.length > maxFeatures) {
            maxFeatures = competitor.features.length;
            leader = competitor;
        }
    });
    
    if (!leader) return null;
    
    return {
        name: leader.name || "Unknown",
        count: maxFeatures,
        country: leader.country || ""
    };
}

// Find unique features (implemented by only one competitor)
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

// Function to fix market standard features rendering
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

// Function to ensure Market Standard list is populated
function renderMarketStandard(marketStandard, competitors) {
    const marketStandardList = document.getElementById('market-standard-list');
    if (!marketStandardList) return;
    
    marketStandardList.innerHTML = '';
    
    if (!marketStandard || !Array.isArray(marketStandard) || marketStandard.length === 0) {
        marketStandardList.innerHTML = '<li class="empty-item">No market standard features found</li>';
        return;
    }
    
    marketStandard.forEach((feature, index) => {
        if (index < 5) { // Show top 5
            const li = document.createElement('li');
            li.innerHTML = `${feature.name} <span class="adoption">${feature.adoption}% adoption</span>`;
            marketStandardList.appendChild(li);
        }
    });
}

// Find feature clusters (features that typically appear together)
function findFeatureClusters(competitors, allFeatures) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allFeatures || !Array.isArray(allFeatures) || allFeatures.length === 0) {
        return [];
    }
    
    // Create a co-occurrence matrix
    const coOccurrenceMatrix = {};
    
    // Initialize matrix
    allFeatures.forEach(feature1 => {
        if (!feature1) return;
        
        coOccurrenceMatrix[feature1] = {};
        allFeatures.forEach(feature2 => {
            if (!feature2 || feature1 === feature2) return;
            coOccurrenceMatrix[feature1][feature2] = 0;
        });
    });
    
    // Fill the matrix
    competitors.forEach(competitor => {
        if (!competitor || !competitor.features || !Array.isArray(competitor.features)) {
            return; // Skip invalid competitors
        }
        
        const features = competitor.features.filter(f => f); // Filter out empty features
        
        for (let i = 0; i < features.length; i++) {
            for (let j = 0; j < features.length; j++) {
                if (i !== j) {
                    const feature1 = features[i];
                    const feature2 = features[j];
                    
                    if (coOccurrenceMatrix[feature1] && coOccurrenceMatrix[feature1][feature2] !== undefined) {
                        coOccurrenceMatrix[feature1][feature2] += 1;
                    }
                }
            }
        }
    });
    
    // Find the strongest connections
    const clusters = [];
    const processedPairs = new Set();
    
    allFeatures.forEach(feature1 => {
        if (!feature1) return;
        
        allFeatures.forEach(feature2 => {
            if (!feature2 || feature1 === feature2) return;
            
            const pairKey = [feature1, feature2].sort().join('|||');
            if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                
                const strength = coOccurrenceMatrix[feature1] && coOccurrenceMatrix[feature1][feature2] 
                    ? coOccurrenceMatrix[feature1][feature2] : 0;
                
                if (strength > 1) {  // At least 2 competitors have both features
                    clusters.push({
                        features: [feature1, feature2],
                        strength: strength,
                        percentage: Math.round((strength / competitors.length) * 100)
                    });
                }
            }
        });
    });
    
    // Sort clusters by strength
    return clusters.sort((a, b) => b.strength - a.strength).slice(0, 10); // Top 10 clusters
}

// Setup category filter UI
function setupFeatureCategoryFilter(categories, container) {
    // Use the provided container or try to find it
    const filterContainer = container || document.getElementById('feature-filters');
    if (!filterContainer) return;
    
    // Clear existing content
    filterContainer.innerHTML = '';
    
    // Create category filter
    const categoryFilter = document.createElement('div');
    categoryFilter.className = 'filter-section';
    categoryFilter.innerHTML = `
        <h4>Filter by Category</h4>
        <div class="filter-options">
            <label>
                <input type="radio" name="category" class="category-filter" value="all" checked>
                All Categories
            </label>
            ${categories.map(category => `
                <label>
                    <input type="radio" name="category" class="category-filter" value="${category}">
                    ${category}
                </label>
            `).join('')}
        </div>
    `;
    
    // Create adoption rate filter
    const adoptionFilter = document.createElement('div');
    adoptionFilter.className = 'filter-section';
    adoptionFilter.innerHTML = `
        <h4>Filter by Adoption</h4>
        <div class="filter-options">
            <label>
                <input type="radio" name="adoption" class="adoption-filter" value="all" checked>
                All Rates
            </label>
            <label>
                <input type="radio" name="adoption" class="adoption-filter" value="high">
                High (≥70%)
            </label>
            <label>
                <input type="radio" name="adoption" class="adoption-filter" value="medium">
                Medium (30-70%)
            </label>
            <label>
                <input type="radio" name="adoption" class="adoption-filter" value="low">
                Low (<30%)
            </label>
        </div>
    `;
    
    // Create special filters
    const specialFilter = document.createElement('div');
    specialFilter.className = 'filter-section';
    specialFilter.innerHTML = `
        <h4>Special Filters</h4>
        <div class="filter-options">
            <label>
                <input type="checkbox" id="show-unique" class="special-filter">
                Show Only Unique Features
            </label>
            <label>
                <input type="checkbox" id="show-standard" class="special-filter">
                Show Only Market Standard
            </label>
        </div>
    `;
    
    // Add filters to container
    filterContainer.appendChild(categoryFilter);
    filterContainer.appendChild(adoptionFilter);
    filterContainer.appendChild(specialFilter);
}

// Filter features based on selected criteria
function filterFeatures() {
    const selectedCategory = document.querySelector('.category-filter:checked')?.value;
    const selectedAdoption = document.querySelector('.adoption-filter:checked')?.value;
    const showUnique = document.getElementById('show-unique')?.checked;
    const showStandard = document.getElementById('show-standard')?.checked;
    
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        let show = true;
        
        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            show = show && item.dataset.category === selectedCategory;
        }
        
        // Filter by adoption rate
        if (selectedAdoption && selectedAdoption !== 'all') {
            const adoption = parseInt(item.dataset.adoption);
            switch (selectedAdoption) {
                case 'high':
                    show = show && adoption >= 70;
                    break;
                case 'medium':
                    show = show && adoption >= 30 && adoption < 70;
                    break;
                case 'low':
                    show = show && adoption < 30;
                    break;
            }
        }
        
        // Filter by special attributes
        if (showUnique) {
            show = show && item.dataset.unique === 'true';
        }
        
        if (showStandard) {
            show = show && item.dataset.standard === 'true';
        }
        
        // Show or hide the item
        item.style.display = show ? '' : 'none';
    });
}

// Generate a feature distribution heatmap
function generateFeatureHeatmap(competitors, topFeatures) {
    const heatmapContainer = document.getElementById('feature-heatmap');
    if (!heatmapContainer) return;
    
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 ||
        !topFeatures || !Array.isArray(topFeatures) || topFeatures.length === 0) {
        heatmapContainer.innerHTML = '<div class="no-data">Insufficient data for heatmap</div>';
        return;
    }
    
    heatmapContainer.innerHTML = '';
    
    // Create a scrollable container
    const scrollableContainer = document.createElement('div');
    scrollableContainer.className = 'heatmap-scrollable-container';
    
    // Create a table for the heatmap
    const table = document.createElement('table');
    table.className = 'heatmap-table';
    // Ensure the table is wide enough to trigger horizontal scrolling
    table.style.minWidth = "100%";
    
    // Create header row with competitor names
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Feature</th>';
    
    // Get all competitors sorted by number of features
    const validCompetitors = competitors.filter(comp => comp && comp.features && Array.isArray(comp.features));
    const sortedCompetitors = [...validCompetitors]
        .sort((a, b) => b.features.length - a.features.length);
    
    if (sortedCompetitors.length === 0) {
        heatmapContainer.innerHTML = '<div class="no-data">No competitor data available</div>';
        return;
    }
    
    sortedCompetitors.forEach(competitor => {
        // Set a width for each competitor column to ensure table is wide enough for scrolling
        headerRow.innerHTML += `<th style="min-width: 100px;">${competitor.name || 'Unknown'}</th>`;
    });
    
    table.appendChild(headerRow);
    
    // Create rows for each feature
    topFeatures.forEach(feature => {
        if (!feature) return;
        
        const featureName = typeof feature === 'object' ? feature.name : feature;
        
        const row = document.createElement('tr');
        row.innerHTML = `<td>${featureName}</td>`;
        
        sortedCompetitors.forEach(competitor => {
            if (!competitor.features) {
                row.innerHTML += `<td class="no-feature"></td>`;
                return;
            }
            
            const hasFeature = competitor.features.includes(featureName);
            row.innerHTML += `<td class="${hasFeature ? 'has-feature' : 'no-feature'}">${hasFeature ? '✓' : ''}</td>`;
        });
        
        table.appendChild(row);
    });
    
    scrollableContainer.appendChild(table);
    heatmapContainer.appendChild(scrollableContainer);
}

// Generate a bar chart of top features by adoption rate
function generateFeatureBarChart(topFeatures, featureCounts, totalCompetitors) {
    const chartContainer = document.getElementById('feature-bar-chart');
    if (!chartContainer) return;
    
    if (!topFeatures || !Array.isArray(topFeatures) || topFeatures.length === 0 || 
        !featureCounts || typeof totalCompetitors !== 'number' || totalCompetitors <= 0) {
        chartContainer.innerHTML = '<div class="no-data">Insufficient data for chart</div>';
        return;
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not loaded. Bar chart cannot be generated.");
        chartContainer.innerHTML = '<div class="error-message">Chart.js library is required for this visualization.</div>';
        return;
    }
    
    chartContainer.innerHTML = '<canvas id="featuresBarChart"></canvas>';
    
    const ctx = document.getElementById('featuresBarChart');
    if (!ctx) {
        console.error("Canvas element not found");
        return;
    }
    
    // Prepare data for chart
    const labels = topFeatures.map(feature => {
        // Truncate long feature names
        return feature.length > 20 ? feature.substring(0, 17) + '...' : feature;
    });
    
    const data = topFeatures.map(feature => {
        return (featureCounts[feature] || 0) / totalCompetitors * 100;
    });
    
    try {
        // Create chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Adoption Rate (%)',
                    data: data,
                    backgroundColor: 'rgba(220, 0, 40, 0.7)',
                    borderColor: 'rgba(220, 0, 40, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Adoption Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Features'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Adoption: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating bar chart:", error);
        chartContainer.innerHTML = `<div class="error-message">Error creating chart: ${error.message}</div>`;
    }
}

// Render features with enhanced analytics
function renderFeatures(features) {
    console.log("Rendering features...", features && features.length);
    
    const featureList = document.getElementById('feature-list');
    if (!featureList) {
        console.error("Feature list container not found");
        return;
    }
    
    featureList.innerHTML = '';
    
    if (!features || !Array.isArray
