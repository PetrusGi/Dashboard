// Functions for handling competitor data and interactions

// Update competitor counts for features, ERPs, and lead magnets
function updateCompetitorCounts(competitors) {
    // Count features
    const featureCounts = {};
    const featureCompanies = {};
    
    // Count ERPs
    const erpCounts = {};
    const erpCompanies = {};
    
    // Count lead magnets
    const leadMagnetCounts = {};
    const leadMagnetCompanies = {};
    
    // Process all competitors
    competitors.forEach(competitor => {
        // Count features
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
            featureCompanies[feature] = featureCompanies[feature] || [];
            featureCompanies[feature].push(competitor.name);
        });
        
        // Count ERPs
        competitor.erps.forEach(erp => {
            erpCounts[erp] = (erpCounts[erp] || 0) + 1;
            erpCompanies[erp] = erpCompanies[erp] || [];
            erpCompanies[erp].push(competitor.name);
        });
        
        // Count lead magnets
        competitor.leadMagnets.forEach(leadMagnet => {
            leadMagnetCounts[leadMagnet] = (leadMagnetCounts[leadMagnet] || 0) + 1;
            leadMagnetCompanies[leadMagnet] = leadMagnetCompanies[leadMagnet] || [];
            leadMagnetCompanies[leadMagnet].push(competitor.name);
        });
    });
    
    // Update feature counts in UI
    updateCountsInUI('feature', featureCounts, featureCompanies);
    
    // Update ERP counts in UI
    updateCountsInUI('erp', erpCounts, erpCompanies);
    
    // Update lead magnet counts in UI
    updateCountsInUI('leadmagnet', leadMagnetCounts, leadMagnetCompanies);
}

// Update counts and companies in UI
function updateCountsInUI(type, counts, companies) {
    // Get all items of this type
    const items = document.querySelectorAll(`.${type}-item`);
    
    items.forEach(item => {
        const nameElement = item.querySelector(`.${type}-name`);
        const countElement = item.querySelector(`.${type}-count`);
        const companyTags = item.querySelector('.company-tags');
        
        if (!nameElement) return;
        
        const name = nameElement.textContent;
        const count = counts[name] || 0;
        const companyList = companies[name] || [];
        
        // Update count
        if (countElement) {
            countElement.textContent = count;
        }
        
        // Update company tags
        if (companyTags) {
            companyTags.innerHTML = '';
            
            companyList.forEach(company => {
                const tag = document.createElement('span');
                tag.className = 'company-tag';
                tag.textContent = company;
                companyTags.appendChild(tag);
            });
        }
    });
}

// Delete a competitor
async function deleteCompetitor(competitorId) {
    if (!confirm('Are you sure you want to delete this competitor? This action cannot be undone.')) {
        return;
    }
    
    try {
        const competitors = await fetchData('competitors.json');
        const updatedCompetitors = competitors.filter(comp => comp.id !== competitorId);
        
        await saveData('competitors.json', updatedCompetitors);
        
        // Close modal
        const modal = document.getElementById('competitor-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Refresh data
        initializeData();
        
        alert('Competitor deleted successfully');
    } catch (error) {
        console.error('Error deleting competitor:', error);
        alert('Failed to delete competitor. Please try again.');
    }
}

// Function to save competitor to database with global filtering support
async function saveCompetitorToDatabase(competitor) {
    // First fetch all competitors
    const competitors = await fetchData('competitors.json');
    
    // Check if competitor already exists
    const existingIndex = competitors.findIndex(comp => comp.id === competitor.id);
    
    if (existingIndex >= 0) {
        // Update existing competitor
        competitors[existingIndex] = competitor;
    } else {
        // Add new competitor
        competitors.push(competitor);
    }
    
    // Save updated competitors list
    await saveData('competitors.json', competitors);
    
    // Update features, ERPs, and lead magnets lists
    await updateTagList('features.json', competitor.features);
    await updateTagList('erps.json', competitor.erps);
    await updateTagList('leadmagnets.json', competitor.leadMagnets);
    
    // If global filtering is active, reapply it
    if (typeof globalFilterState !== 'undefined' && globalFilterState.isFilterActive) {
        setTimeout(() => {
            applyGlobalFilters();
        }, 100);
    }
    
    return { success: true };
}

// Render competitors with support for global filtering
function renderCompetitors(competitors) {
    const competitorsGrid = document.getElementById('competitors-grid');
    competitorsGrid.innerHTML = '';
    
    competitors.forEach(competitor => {
        const competitorCard = document.createElement('div');
        competitorCard.className = 'competitor-card';
        competitorCard.dataset.id = competitor.id;
        competitorCard.dataset.country = competitor.country;
        
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
    
    // Apply global filtering if active
    if (typeof globalFilterState !== 'undefined' && globalFilterState.isFilterActive) {
        // Use a small delay to ensure DOM is updated
        setTimeout(() => {
            applyGlobalFilters();
        }, 100);
    }
    
    // Update competitor counts
    updateCompetitorCounts(competitors);
}

// Event delegation for competitor actions
document.addEventListener('click', function(e) {
    // Delete competitor button
    if (e.target.classList.contains('delete-competitor-btn')) {
        const competitorId = e.target.closest('.competitor-card').dataset.id;
        deleteCompetitor(competitorId);
    }
});

// Enhances the competitors rendering to include counts and statistical information
function enhanceCompetitorsData(competitors) {
    // Count total competitors
    document.querySelector('#total-competitors').textContent = competitors.length;
    
    // Get common features (used by more than 50% of competitors)
    const featureCounts = {};
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
    });
    
    const commonFeatures = Object.entries(featureCounts)
        .filter(([_, count]) => count >= competitors.length * 0.5)
        .map(([feature, _]) => feature);
    
    // Update common features list
    const commonFeaturesList = document.querySelector('#common-features-list');
    if (commonFeaturesList) {
        commonFeaturesList.innerHTML = '';
        commonFeatures.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            commonFeaturesList.appendChild(li);
        });
    }
    
    // Update average subscriptions per competitor
    const avgSubscriptions = competitors.reduce((acc, comp) => acc + comp.subscriptionModels.length, 0) / competitors.length;
    document.querySelector('#avg-subscriptions').textContent = avgSubscriptions.toFixed(1);
    
    return competitors;
}

// Open competitor edit modal
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
