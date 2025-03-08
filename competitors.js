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
    updateCountsInUI('leadmagnet', erpCounts, erpCompanies);
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
