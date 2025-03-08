// Functions to add new items
function addNewFeature() {
    const featureName = prompt("Enter new feature name:");
    if (featureName && featureName.trim() !== '') {
        // First check if the feature already exists
        fetchData('features.json')
            .then(features => {
                if (features.includes(featureName)) {
                    alert(`Feature "${featureName}" already exists.`);
                    return;
                }
                
                // Add the new feature
                features.push(featureName);
                saveData('features.json', features)
                    .then(() => {
                        initializeData();
                        alert(`Feature "${featureName}" added successfully.`);
                    })
                    .catch(error => {
                        console.error('Error saving feature:', error);
                        alert('Failed to add feature. Please try again.');
                    });
            });
    }
}


// Function to edit a feature
function editFeature(feature) {
    const newName = prompt(`Edit feature: ${feature}`, feature);
    if (newName && newName !== feature) {
        // Update the feature in the database
        updateItemName('features.json', feature, newName)
            .then(() => {
                // Update the feature in all competitors
                updateCompetitorItems('competitors.json', 'features', feature, newName)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Feature renamed to: ${newName}`);
                    });
            })
            .catch(error => {
                console.error('Error updating feature:', error);
                alert('Failed to update feature. Please try again.');
            });
    }
}

// Function to delete a feature
function deleteFeature(feature) {
    if (confirm(`Are you sure you want to delete the feature: ${feature}?`)) {
        // Delete the feature from the database
        deleteItem('features.json', feature)
            .then(() => {
                // Remove the feature from all competitors
                removeItemFromCompetitors('competitors.json', 'features', feature)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Feature deleted: ${feature}`);
                    });
            })
            .catch(error => {
                console.error('Error deleting feature:', error);
                alert('Failed to delete feature. Please try again.');
            });
    }
}
function renderFeatures(features) {
    const featureList = document.getElementById('feature-list');
    featureList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count feature usage
            const featureCounts = {};
            competitors.forEach(competitor => {
                competitor.features.forEach(feature => {
                    featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                });
            });
            
            // Calculate average features per competitor
            const totalFeatures = features.length;
            const avgFeatures = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.features.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-features').textContent = totalFeatures;
            document.getElementById('avg-features').textContent = avgFeatures;
            
            // Get top and least used features
            const sortedFeatures = [...features].sort((a, b) => 
                (featureCounts[b] || 0) - (featureCounts[a] || 0));
            
            const topFeatures = sortedFeatures.slice(0, 5);
            const leastFeatures = sortedFeatures.slice(-5).reverse();
            
            // Render top features
            const topFeaturesList = document.getElementById('top-features-list');
            topFeaturesList.innerHTML = '';
            topFeatures.forEach(feature => {
                const count = featureCounts[feature] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${feature} <span class="count">${count}</span>`;
                topFeaturesList.appendChild(li);
            });
            
            // Render least used features
            const leastFeaturesList = document.getElementById('least-features-list');
            leastFeaturesList.innerHTML = '';
            leastFeatures.forEach(feature => {
                const count = featureCounts[feature] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${feature} <span class="count">${count}</span>`;
                leastFeaturesList.appendChild(li);
            });
            
            // Render all features
            features.forEach(feature => {
                const count = featureCounts[feature] || 0;
                const featureItem = document.createElement('div');
                featureItem.className = 'list-item';
                featureItem.innerHTML = `
                    <span class="list-item-name">${feature}</span>
                    <span class="list-item-count">${count}</span>
                    <div class="list-item-actions">
                        <button title="Edit" class="edit-feature-btn" data-feature="${feature}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button title="Delete" class="delete-feature-btn" data-feature="${feature}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                featureList.appendChild(featureItem);
                
                // Add event listeners for edit and delete
                featureItem.querySelector('.edit-feature-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editFeature(feature);
                });
                
                featureItem.querySelector('.delete-feature-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFeature(feature);
                });
            });
        });
}
