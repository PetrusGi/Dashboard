
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
        if (itemType === 'leadmagnets' && field !== 'leadMagnets') {
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
        if (itemType === 'leadmagnets' && field !== 'leadMagnets') {
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
// Modify the initializeData function in main.js to ensure we don't have redundant initialization

// Find this function in main.js:
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
            
                // Remove this conditional to avoid redundant initialization
                // if (typeof initializeGlobalFilters === 'function') {
                //     initializeGlobalFilters();
                // }
            }
        });
}





// Helper function to close the modal
function closeModal() {
    const modal = document.getElementById('competitor-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Reapply global filters if active
    if (typeof globalFilterState !== 'undefined' && globalFilterState.isFilterActive) {
        applyGlobalFilters();
    }
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
