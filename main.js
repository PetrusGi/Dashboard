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

function addNewERP() {
    const erpName = prompt("Enter new ERP integration name:");
    if (erpName && erpName.trim() !== '') {
        // First check if the ERP already exists
        fetchData('erps.json')
            .then(erps => {
                if (erps.includes(erpName)) {
                    alert(`ERP "${erpName}" already exists.`);
                    return;
                }
                
                // Add the new ERP
                erps.push(erpName);
                saveData('erps.json', erps)
                    .then(() => {
                        initializeData();
                        alert(`ERP "${erpName}" added successfully.`);
                    })
                    .catch(error => {
                        console.error('Error saving ERP:', error);
                        alert('Failed to add ERP. Please try again.');
                    });
            });
    }
}

function addNewLeadMagnet() {
    const leadMagnetName = prompt("Enter new lead magnet name:");
    if (leadMagnetName && leadMagnetName.trim() !== '') {
        // First check if the lead magnet already exists
        fetchData('leadmagnets.json')
            .then(leadMagnets => {
                if (leadMagnets.includes(leadMagnetName)) {
                    alert(`Lead magnet "${leadMagnetName}" already exists.`);
                    return;
                }
                
                // Add the new lead magnet
                leadMagnets.push(leadMagnetName);
                saveData('leadmagnets.json', leadMagnets)
                    .then(() => {
                        initializeData();
                        alert(`Lead magnet "${leadMagnetName}" added successfully.`);
                    })
                    .catch(error => {
                        console.error('Error saving lead magnet:', error);
                        alert('Failed to add lead magnet. Please try again.');
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

// Function to edit an ERP
function editERP(erp) {
    const newName = prompt(`Edit ERP: ${erp}`, erp);
    if (newName && newName !== erp) {
        // Update the ERP in the database
        updateItemName('erps.json', erp, newName)
            .then(() => {
                // Update the ERP in all competitors
                updateCompetitorItems('competitors.json', 'erps', erp, newName)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`ERP renamed to: ${newName}`);
                    });
            })
            .catch(error => {
                console.error('Error updating ERP:', error);
                alert('Failed to update ERP. Please try again.');
            });
    }
}

// Function to delete an ERP
function deleteERP(erp) {
    if (confirm(`Are you sure you want to delete the ERP: ${erp}?`)) {
        // Delete the ERP from the database
        deleteItem('erps.json', erp)
            .then(() => {
                // Remove the ERP from all competitors
                removeItemFromCompetitors('competitors.json', 'erps', erp)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`ERP deleted: ${erp}`);
                    });
            })
            .catch(error => {
                console.error('Error deleting ERP:', error);
                alert('Failed to delete ERP. Please try again.');
            });
    }
}

// Function to edit a lead magnet
function editLeadMagnet(leadMagnet) {
    const newName = prompt(`Edit lead magnet: ${leadMagnet}`, leadMagnet);
    if (newName && newName !== leadMagnet) {
        // Update the lead magnet in the database
        updateItemName('leadmagnets.json', leadMagnet, newName)
            .then(() => {
                // Update the lead magnet in all competitors
                updateCompetitorItems('competitors.json', 'leadMagnets', leadMagnet, newName)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Lead magnet renamed to: ${newName}`);
                    });
            })
            .catch(error => {
                console.error('Error updating lead magnet:', error);
                alert('Failed to update lead magnet. Please try again.');
            });
    }
}

// Function to delete a lead magnet
function deleteLeadMagnet(leadMagnet) {
    if (confirm(`Are you sure you want to delete the lead magnet: ${leadMagnet}?`)) {
        // Delete the lead magnet from the database
        deleteItem('leadmagnets.json', leadMagnet)
            .then(() => {
                // Remove the lead magnet from all competitors
                removeItemFromCompetitors('competitors.json', 'leadMagnets', leadMagnet)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Lead magnet deleted: ${leadMagnet}`);
                    });
            })
            .catch(error => {
                console.error('Error deleting lead magnet:', error);
                alert('Failed to delete lead magnet. Please try again.');
            });
    }
}

// Function to update an item name in a JSON file
async function updateItemName(filename, oldName, newName) {
    try {
        const items = await fetchData(filename);
        const index = items.indexOf(oldName);
        
        if (index !== -1) {
            items[index] = newName;
            await saveData(filename, items);
            return { success: true };
        } else {
            throw new Error(`Item not found: ${oldName}`);
        }
    } catch (error) {
        console.error(`Error updating item in ${filename}:`, error);
        throw error;
    }
}

// Function to delete an item from a JSON file
async function deleteItem(filename, itemName) {
    try {
        const items = await fetchData(filename);
        const updatedItems = items.filter(item => item !== itemName);
        
        if (items.length === updatedItems.length) {
            throw new Error(`Item not found: ${itemName}`);
        }
        
        await saveData(filename, updatedItems);
        return { success: true };
    } catch (error) {
        console.error(`Error deleting item from ${filename}:`, error);
        throw error;
    }
}

// Function to update items in all competitors
async function updateCompetitorItems(filename, itemType, oldName, newName) {
    try {
        const competitors = await fetchData(filename);
        
        let field = itemType;
        if (itemType === 'leadMagnets' && field !== 'leadMagnets') {
            field = 'leadMagnets';
        }
        
        competitors.forEach(competitor => {
            const index = competitor[field].indexOf(oldName);
            if (index !== -1) {
                competitor[field][index] = newName;
            }
        });
        
        await saveData(filename, competitors);
        return { success: true };
    } catch (error) {
        console.error(`Error updating item in competitors:`, error);
        throw error;
    }
}

// Function to remove items from all competitors
async function removeItemFromCompetitors(filename, itemType, itemName) {
    try {
        const competitors = await fetchData(filename);
        
        let field = itemType;
        if (itemType === 'leadMagnets' && field !== 'leadMagnets') {
            field = 'leadMagnets';
        }
        
        competitors.forEach(competitor => {
            competitor[field] = competitor[field].filter(item => item !== itemName);
        });
        
        await saveData(filename, competitors);
        return { success: true };
    } catch (error) {
        console.error(`Error removing item from competitors:`, error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Modal functionality
    const modal = document.getElementById('competitor-modal');
    const addCompetitorBtn = document.getElementById('add-competitor-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const deleteBtn = document.getElementById('delete-competitor-btn');

    addCompetitorBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Competitor';
        clearCompetitorForm();
        // Hide delete button for new competitors
        deleteBtn.style.display = 'none';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Delete competitor button
    deleteBtn.addEventListener('click', () => {
        const competitorId = document.getElementById('competitor-form').dataset.competitorId;
        if (competitorId) {
            deleteCompetitor(competitorId);
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Add subscription button
    const addSubscriptionBtn = document.getElementById('add-subscription-btn');
    addSubscriptionBtn.addEventListener('click', addSubscriptionModel);

    // Handle subscription removal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-subscription')) {
            const subscriptionContainer = document.getElementById('subscription-container');
            if (subscriptionContainer.children.length > 1) {
                e.target.closest('.subscription-model').remove();
            } else {
                alert('At least one subscription model is required.');
            }
        }
    });

    // Form submission
    const competitorForm = document.getElementById('competitor-form');
    competitorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveCompetitor();
    });

    // Search functionality
    setupSearch('feature-search', 'feature-list');
    setupSearch('erp-search', 'erp-list');
    setupSearch('leadmagnet-search', 'leadmagnet-list');
    setupSearch('competitor-search', 'competitors-grid');
    
    // Add feature, ERP, and lead magnet buttons
    document.getElementById('add-feature-btn').addEventListener('click', addNewFeature);
    document.getElementById('add-erp-btn').addEventListener('click', addNewERP);
    document.getElementById('add-leadmagnet-btn').addEventListener('click', addNewLeadMagnet);

    // Initialize data
    initializeData();
    
    // Global click handler to close expanded notes when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.expandable-note')) {
            document.querySelectorAll('.note-full-content:not(.hidden)').forEach(openNote => {
                openNote.classList.add('hidden');
            });
        }
    });
});

// Initialize data and load from JSON files
function initializeData() {
    // Load all data from JSON files
    fetchData('features.json')
        .then(data => {
            if (data) {
                renderFeatures(data);
                setupTagSuggestions('feature-input', 'feature-suggestions', data);
            }
        });

    fetchData('erps.json')
        .then(data => {
            if (data) {
                renderERPs(data);
                setupTagSuggestions('erp-input', 'erp-suggestions', data);
            }
        });

    fetchData('leadmagnets.json')
        .then(data => {
            if (data) {
                renderLeadMagnets(data);
                setupTagSuggestions('leadmagnet-input', 'leadmagnet-suggestions', data);
            }
        });

    fetchData('competitors.json')
        .then(data => {
            if (data) {
                renderCompetitors(data);
                renderPricing(data);
            }
        });
}

// Helper function to close the modal
function closeModal() {
    const modal = document.getElementById('competitor-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Updated function to add a new subscription model UI
function addSubscriptionModel() {
    const subscriptionContainer = document.getElementById('subscription-container');
    const newSubscription = document.createElement('div');
    newSubscription.className = 'subscription-model';
    newSubscription.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Subscription Name</label>
                <input type="text" class="sub-name" required>
            </div>
            <div class="form-group">
                <label>Current Price</label>
                <input type="number" class="sub-current-price" step="0.01" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Invoice Amount</label>
                <input type="number" class="sub-invoice-amount" step="0.01">
            </div>
            <div class="form-group">
                <label>Invoice Frequency</label>
                <select class="sub-invoice-frequency">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Old Price (Optional)</label>
                <input type="number" class="sub-old-price" step="0.01">
            </div>
            <div class="form-group">
                <label>Old Price Date</label>
                <input type="date" class="sub-old-date">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group subscription-notes">
                <label>Notes</label>
                <textarea class="sub-notes" placeholder="Enter any additional notes about this subscription model..."></textarea>
            </div>
        </div>
        <button type="button" class="remove-subscription">Remove</button>
    `;
    subscriptionContainer.appendChild(newSubscription);
}

// Setup search functionality
function setupSearch(inputId, targetId) {
    const searchInput = document.getElementById(inputId);
    const targetContainer = document.getElementById(targetId);

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const items = targetContainer.children;
        
        for (let item of items) {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Setup tag suggestions
function setupTagSuggestions(inputId, suggestionsId, items) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    const selectedContainer = document.getElementById(`selected-${inputId.split('-')[0]}s`);
    
    // Track selected tags
    const selectedTags = new Set();
    
    input.addEventListener('input', () => {
        const value = input.value.toLowerCase();
        suggestions.innerHTML = '';
        
        if (value.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
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
                addTag(item, selectedContainer, selectedTags);
                input.value = '';
                suggestions.style.display = 'none';
            });
            suggestions.appendChild(div);
        });
        
        suggestions.style.display = 'block';
    });
    
    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== suggestions) {
            suggestions.style.display = 'none';
        }
    });
    
    // Allow adding custom tags with Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== '') {
            e.preventDefault();
            const newTag = input.value.trim();
            addTag(newTag, selectedContainer, selectedTags);
            input.value = '';
            suggestions.style.display = 'none';
        }
    });
}

// Add a tag to the selected container
function addTag(tag, container, selectedSet) {
    selectedSet.add(tag);
    
    const tagElement = document.createElement('div');
    tagElement.className = 'tag-item';
    tagElement.innerHTML = `
        ${tag}
        <span class="remove-tag">&times;</span>
    `;
    
    tagElement.querySelector('.remove-tag').addEventListener('click', () => {
        container.removeChild(tagElement);
        selectedSet.delete(tag);
    });
    
    container.appendChild(tagElement);
}

// Updated function to clear the competitor form
function clearCompetitorForm() {
    document.getElementById('comp-name').value = '';
    document.getElementById('comp-country').value = '';
    document.getElementById('comp-website').value = '';
    
    // Reset subscription models
    const subscriptionContainer = document.getElementById('subscription-container');
    subscriptionContainer.innerHTML = `
        <div class="subscription-model">
            <div class="form-row">
                <div class="form-group">
                    <label>Subscription Name</label>
                    <input type="text" class="sub-name" required>
                </div>
                <div class="form-group">
                    <label>Current Price</label>
                    <input type="number" class="sub-current-price" step="0.01" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Invoice Amount</label>
                    <input type="number" class="sub-invoice-amount" step="0.01">
                </div>
                <div class="form-group">
                    <label>Invoice Frequency</label>
                    <select class="sub-invoice-frequency">
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Old Price (Optional)</label>
                    <input type="number" class="sub-old-price" step="0.01">
                </div>
                <div class="form-group">
                    <label>Old Price Date</label>
                    <input type="date" class="sub-old-date">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group subscription-notes">
                    <label>Notes</label>
                    <textarea class="sub-notes" placeholder="Enter any additional notes about this subscription model..."></textarea>
                </div>
            </div>
            <button type="button" class="remove-subscription">Remove</button>
        </div>
    `;
    
    // Clear selected tags
    document.getElementById('selected-features').innerHTML = '';
    document.getElementById('selected-erps').innerHTML = '';
    document.getElementById('selected-leadmagnets').innerHTML = '';
}

// Render functions for each data type
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

function renderERPs(erps) {
    const erpList = document.getElementById('erp-list');
    erpList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count ERP usage
            const erpCounts = {};
            competitors.forEach(competitor => {
                competitor.erps.forEach(erp => {
                    erpCounts[erp] = (erpCounts[erp] || 0) + 1;
                });
            });
            
            // Calculate average ERPs per competitor
            const totalERPs = erps.length;
            const avgERPs = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.erps.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-erps').textContent = totalERPs;
            document.getElementById('avg-erps').textContent = avgERPs;
            
            // Get top and least used ERPs
            const sortedERPs = [...erps].sort((a, b) => 
                (erpCounts[b] || 0) - (erpCounts[a] || 0));
            
            const topERPs = sortedERPs.slice(0, 5);
            const leastERPs = sortedERPs.slice(-5).reverse();
            
            // Render top ERPs
            const topERPsList = document.getElementById('top-erps-list');
            topERPsList.innerHTML = '';
            topERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                topERPsList.appendChild(li);
            });
            
            // Render least used ERPs
            const leastERPsList = document.getElementById('least-erps-list');
            leastERPsList.innerHTML = '';
            leastERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                leastERPsList.appendChild(li);
            });
            
            // Render all ERPs
            erps.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const erpItem = document.createElement('div');
                erpItem.className = 'list-item';
                erpItem.innerHTML = `
                    <span class="list-item-name">${erp}</span>
                    <span class="list-item-count">${count}</span>
                    <div class="list-item-actions">
                        <button title="Edit" class="edit-erp-btn" data-erp="${erp}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button title="Delete" class="delete-erp-btn" data-erp="${erp}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                erpList.appendChild(erpItem);
                
                // Add event listeners for edit and delete
                erpItem.querySelector('.edit-erp-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editERP(erp);
                });
                
                erpItem.querySelector('.delete-erp-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteERP(erp);
                });
            });
        });
}

function renderLeadMagnets(leadMagnets) {
    const leadMagnetList = document.getElementById('leadmagnet-list');
    leadMagnetList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count lead magnet usage
            const leadMagnetCounts = {};
            competitors.forEach(competitor => {
                competitor.leadMagnets.forEach(leadMagnet => {
                    leadMagnetCounts[leadMagnet] = (leadMagnetCounts[leadMagnet] || 0) + 1;
                });
            });
            
            // Calculate average lead magnets per competitor
            const totalLeadMagnets = leadMagnets.length;
            const avgLeadMagnets = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.leadMagnets.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-leadmagnets').textContent = totalLeadMagnets;
            document.getElementById('avg-leadmagnets').textContent = avgLeadMagnets;
            
            // Get top and least used lead magnets
            const sortedLeadMagnets = [...leadMagnets].sort((a, b) => 
                (leadMagnetCounts[b] || 0) - (leadMagnetCounts[a] || 0));
            
            const topLeadMagnets = sortedLeadMagnets.slice(0, 5);
            const leastLeadMagnets = sortedLeadMagnets.slice(-5).reverse();
            
            // Render top lead magnets
            const topLeadMagnetsList = document.getElementById('top-leadmagnets-list');
            topLeadMagnetsList.innerHTML = '';
            topLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                topLeadMagnetsList.appendChild(li);
            });
            
            // Render least used lead magnets
            const leastLeadMagnetsList = document.getElementById('least-leadmagnets-list');
            leastLeadMagnetsList.innerHTML = '';
            leastLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                leastLeadMagnetsList.appendChild(li);
            });
            
            // Render all lead magnets
            leadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const leadMagnetItem = document.createElement('div');
                leadMagnetItem.className = 'list-item';
                leadMagnetItem.innerHTML = `
                    <span class="list-item-name">${leadMagnet}</span>
                    <span class="list-item-count">${count}</span>
                    <div class="list-item-actions">
                        <button title="Edit" class="edit-leadmagnet-btn" data-leadmagnet="${leadMagnet}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button title="Delete" class="delete-leadmagnet-btn" data-leadmagnet="${leadMagnet}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                leadMagnetList.appendChild(leadMagnetItem);
                
                // Add event listeners for edit and delete
                leadMagnetItem.querySelector('.edit-leadmagnet-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editLeadMagnet(leadMagnet);
                });
                
                leadMagnetItem.querySelector('.delete-leadmagnet-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteLeadMagnet(leadMagnet);
                });
            });
        });
}

function renderCompetitors(competitors) {
    const competitorsGrid = document.getElementById('competitors-grid');
    competitorsGrid.innerHTML = '';
    
    competitors.forEach(competitor => {
        const competitorCard = document.createElement('div');
        competitorCard.className = 'competitor-card';
        competitorCard.dataset.id = competitor.id;
        
        // Get first 3 features and count
        const featureExamples = competitor.features.slice(0, 3);
        const featureCount = competitor.features.length > 3 ? 
            `+${competitor.features.length - 3} more` : '';
        
        competitorCard.innerHTML = `
            <div class="competitor-header">
                <span class="competitor-name">${competitor.name}</span>
                <span class="competitor-country">${competitor.country}</span>
            </div>
            <div class="competitor-details">
                <div class="detail-section">
                    <div class="detail-title">Features</div>
                    <div class="tag-list">
                        ${featureExamples.map(feature => `<span class="tag">${feature}</span>`).join('')}
                        ${featureCount ? `<span class="tag">${featureCount}</span>` : ''}
                    </div>
                </div>
                <div class="detail-section">
                    <div class="detail-title">Subscriptions</div>
                    <div class="tag-list">
                        ${competitor.subscriptionModels.map(sub => 
                            `<span class="tag">${sub.name}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        competitorCard.addEventListener('click', () => {
            openCompetitorEdit(competitor);
        });
        
        competitorsGrid.appendChild(competitorCard);
    });
}


// Updated function to open competitor edit modal
function openCompetitorEdit(competitor) {
    document.getElementById('modal-title').textContent = 'Edit Competitor';
    
    // Show delete button for existing competitors
    document.getElementById('delete-competitor-btn').style.display = 'block';
    
    // Fill in basic details
    document.getElementById('comp-name').value = competitor.name;
    document.getElementById('comp-country').value = competitor.country;
    document.getElementById('comp-website').value = competitor.website || '';
    
    // Add subscription models
    const subscriptionContainer = document.getElementById('subscription-container');
    subscriptionContainer.innerHTML = '';
    
    competitor.subscriptionModels.forEach(subscription => {
        const subModel = document.createElement('div');
        subModel.className = 'subscription-model';
        
        subModel.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Subscription Name</label>
                    <input type="text" class="sub-name" value="${subscription.name}" required>
                </div>
                <div class="form-group">
                    <label>Current Price</label>
                    <input type="number" class="sub-current-price" value="${subscription.currentPrice}" step="0.01" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Invoice Amount</label>
                    <input type="number" class="sub-invoice-amount" value="${subscription.invoiceAmount || ''}" step="0.01">
                </div>
                <div class="form-group">
                    <label>Invoice Frequency</label>
                    <select class="sub-invoice-frequency">
                        <option value="monthly" ${subscription.invoiceFrequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                        <option value="quarterly" ${subscription.invoiceFrequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                        <option value="annually" ${subscription.invoiceFrequency === 'annually' ? 'selected' : ''}>Annually</option>
                        <option value="custom" ${subscription.invoiceFrequency === 'custom' ? 'selected' : ''}>Custom</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Old Price (Optional)</label>
                    <input type="number" class="sub-old-price" value="${subscription.oldPrice || ''}" step="0.01">
                </div>
                <div class="form-group">
                    <label>Old Price Date</label>
                    <input type="date" class="sub-old-date" value="${subscription.oldPriceDate || ''}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group subscription-notes">
                    <label>Notes</label>
                    <textarea class="sub-notes" placeholder="Enter any additional notes about this subscription model...">${subscription.notes || ''}</textarea>
                </div>
            </div>
            <button type="button" class="remove-subscription">Remove</button>
        `;
        
        subscriptionContainer.appendChild(subModel);
    });
    
    // Add tags
    const selectedFeatures = document.getElementById('selected-features');
    const selectedERPs = document.getElementById('selected-erps');
    const selectedLeadMagnets = document.getElementById('selected-leadmagnets');
    
    selectedFeatures.innerHTML = '';
    selectedERPs.innerHTML = '';
    selectedLeadMagnets.innerHTML = '';
    
    // Track selected tags
    const featureTags = new Set();
    const erpTags = new Set();
    const leadMagnetTags = new Set();
    
    // Add features
    competitor.features.forEach(feature => {
        addTag(feature, selectedFeatures, featureTags);
    });
    
    // Add ERPs
    competitor.erps.forEach(erp => {
        addTag(erp, selectedERPs, erpTags);
    });
    
    // Add lead magnets
    competitor.leadMagnets.forEach(leadMagnet => {
        addTag(leadMagnet, selectedLeadMagnets, leadMagnetTags);
    });
    
    // Set competitor ID for form submission
    document.getElementById('competitor-form').dataset.competitorId = competitor.id;
    
    // Show modal
    document.getElementById('competitor-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Updated function to save competitor data with invoice and notes
function saveCompetitor() {
    const form = document.getElementById('competitor-form');
    const competitorId = form.dataset.competitorId || generateId();
    
    // Gather basic information
    const name = document.getElementById('comp-name').value;
    const country = document.getElementById('comp-country').value;
    const website = document.getElementById('comp-website').value;
    
    // Gather subscription information
    const subscriptionModels = [];
    const subscriptionElements = document.querySelectorAll('.subscription-model');
    
    subscriptionElements.forEach(element => {
        const name = element.querySelector('.sub-name').value;
        const currentPrice = parseFloat(element.querySelector('.sub-current-price').value);
        const oldPriceElement = element.querySelector('.sub-old-price');
        const oldDateElement = element.querySelector('.sub-old-date');
        const invoiceAmountElement = element.querySelector('.sub-invoice-amount');
        const invoiceFrequencyElement = element.querySelector('.sub-invoice-frequency');
        const notesElement = element.querySelector('.sub-notes');
        
        const subscriptionModel = {
            name,
            currentPrice,
            currentPriceDate: new Date().toISOString().split('T')[0]
        };
        
        if (oldPriceElement.value) {
            subscriptionModel.oldPrice = parseFloat(oldPriceElement.value);
        }
        
        if (oldDateElement.value) {
            subscriptionModel.oldPriceDate = oldDateElement.value;
        }
        
        // Add invoice amount if provided
        if (invoiceAmountElement && invoiceAmountElement.value) {
            subscriptionModel.invoiceAmount = parseFloat(invoiceAmountElement.value);
        }
        
        // Add invoice frequency if provided
        if (invoiceFrequencyElement && invoiceFrequencyElement.value) {
            subscriptionModel.invoiceFrequency = invoiceFrequencyElement.value;
        }
        
        // Add notes if provided
        if (notesElement && notesElement.value) {
            subscriptionModel.notes = notesElement.value;
        }
        
        subscriptionModels.push(subscriptionModel);
    });
    
    // Gather features, ERPs, and lead magnets
    const features = Array.from(document.getElementById('selected-features').children)
        .map(tag => tag.textContent.replace('×', '').trim());
    
    const erps = Array.from(document.getElementById('selected-erps').children)
        .map(tag => tag.textContent.replace('×', '').trim());
    
    const leadMagnets = Array.from(document.getElementById('selected-leadmagnets').children)
        .map(tag => tag.textContent.replace('×', '').trim());
    
    // Create competitor object
    const competitor = {
        id: competitorId,
        name,
        country,
        website,
        subscriptionModels,
        features,
        erps,
        leadMagnets
    };
    
    // Save to database
    saveCompetitorToDatabase(competitor)
        .then(() => {
            closeModal();
            // Refresh data
            initializeData();
        })
        .catch(error => {
            console.error('Error saving competitor:', error);
            alert('Failed to save competitor. Please try again.');
        });
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}