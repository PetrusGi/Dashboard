// pricing.js - Functions for handling pricing-related functionality

// --- Helper functions for pricing summary cards ---

function getCheapestSubscription(competitors) {
    let cheapest = null;
    competitors.forEach(comp => {
        comp.subscriptionModels.forEach(sub => {
            if (typeof sub.currentPrice === 'number') { // Only consider numeric prices
                if (!cheapest || sub.currentPrice < cheapest.price) {
                    cheapest = {
                        competitorName: comp.name,
                        planName: sub.name,
                        price: sub.currentPrice
                    };
                }
            }
        });
    });
    return cheapest;
}

function getMostExpensiveSubscription(competitors) {
    let mostExpensive = null;
    competitors.forEach(comp => {
        comp.subscriptionModels.forEach(sub => {
            if (typeof sub.currentPrice === 'number') { // Only consider numeric prices
                if (!mostExpensive || sub.currentPrice > mostExpensive.price) {
                    mostExpensive = {
                        competitorName: comp.name,
                        planName: sub.name,
                        price: sub.currentPrice
                    };
                }
            }
        });
    });
    return mostExpensive;
}

function getBiggestPriceChange(competitors, findHike = true) {
    let biggestChange = null;
    let extremePercent = findHike ? -Infinity : Infinity;

    competitors.forEach(comp => {
        comp.subscriptionModels.forEach(sub => {
            // Ensure both oldPrice and currentPrice are numbers and oldPrice is positive
            if (typeof sub.oldPrice === 'number' && sub.oldPrice > 0 && 
                typeof sub.currentPrice === 'number') {
                const percentChange = ((sub.currentPrice - sub.oldPrice) / sub.oldPrice) * 100;
                
                if (findHike) { // Biggest Hike
                    if (percentChange > extremePercent) {
                        extremePercent = percentChange;
                        biggestChange = {
                            competitorName: comp.name,
                            planName: sub.name,
                            percentChange: percentChange,
                            oldPrice: sub.oldPrice,
                            newPrice: sub.currentPrice
                        };
                    }
                } else { // Biggest Drop
                    if (percentChange < extremePercent) {
                        extremePercent = percentChange;
                        biggestChange = {
                            competitorName: comp.name,
                            planName: sub.name,
                            percentChange: percentChange,
                            oldPrice: sub.oldPrice,
                            newPrice: sub.currentPrice
                        };
                    }
                }
            }
        });
    });
    return biggestChange;
}

function populatePricingSummaryCards(competitors) {
    const cheapestCard = document.getElementById('cheapest-subscription-card');
    const mostExpensiveCard = document.getElementById('most-expensive-subscription-card');
    const biggestHikeCard = document.getElementById('biggest-price-hike-card');
    const biggestDropCard = document.getElementById('biggest-price-drop-card');

    const cheapestData = getCheapestSubscription(competitors);
    if (cheapestCard && cheapestData) {
        cheapestCard.innerHTML = `<h4>Cheapest Subscription</h4>
                                <p><strong>${cheapestData.competitorName} - ${cheapestData.planName}</strong></p>
                                <p class="price-value">€${cheapestData.price.toFixed(2)}</p>`;
    } else if (cheapestCard) {
        cheapestCard.innerHTML = `<h4>Cheapest Subscription</h4><p>N/A</p>`;
    }

    const mostExpensiveData = getMostExpensiveSubscription(competitors);
    if (mostExpensiveCard && mostExpensiveData) {
        mostExpensiveCard.innerHTML = `<h4>Most Expensive Subscription</h4>
                                     <p><strong>${mostExpensiveData.competitorName} - ${mostExpensiveData.planName}</strong></p>
                                     <p class="price-value">€${mostExpensiveData.price.toFixed(2)}</p>`;
    } else if (mostExpensiveCard) {
        mostExpensiveCard.innerHTML = `<h4>Most Expensive Subscription</h4><p>N/A</p>`;
    }

    const biggestHikeData = getBiggestPriceChange(competitors, true);
    if (biggestHikeCard && biggestHikeData) {
        biggestHikeCard.innerHTML = `<h4>Biggest Price Hike</h4>
                                   <p><strong>${biggestHikeData.competitorName} - ${biggestHikeData.planName}</strong></p>
                                   <p><span class="price-change positive-change">${biggestHikeData.percentChange.toFixed(1)}%</span> (from €${biggestHikeData.oldPrice.toFixed(2)} to €${biggestHikeData.newPrice.toFixed(2)})</p>`;
    } else if (biggestHikeCard) {
        biggestHikeCard.innerHTML = `<h4>Biggest Price Hike</h4><p>N/A</p>`;
    }
    
    const biggestDropData = getBiggestPriceChange(competitors, false);
    if (biggestDropCard && biggestDropData) {
        biggestDropCard.innerHTML = `<h4>Biggest Price Drop</h4>
                                 <p><strong>${biggestDropData.competitorName} - ${biggestDropData.planName}</strong></p>
                                 <p><span class="price-change negative-change">${biggestDropData.percentChange.toFixed(1)}%</span> (from €${biggestDropData.oldPrice.toFixed(2)} to €${biggestDropData.newPrice.toFixed(2)})</p>`;
    } else if (biggestDropCard) {
        biggestDropCard.innerHTML = `<h4>Biggest Price Drop</h4><p>N/A</p>`;
    }
}


// Render pricing data for all competitors
function renderPricing(competitors) {
    const pricingContainer = document.getElementById('pricing-container');
    pricingContainer.innerHTML = '';

    // Populate summary cards
    populatePricingSummaryCards(competitors);
    
    // Sort competitors alphabetically by name
    let sortedCompetitors = [...competitors].sort((a, b) => a.name.localeCompare(b.name));
    
    // Filter competitors to include only those with at least one subscription model having an oldPrice and currentPrice
    const competitorsWithPriceChanges = sortedCompetitors.filter(competitor => {
        return competitor.subscriptionModels && competitor.subscriptionModels.some(sub => 
            typeof sub.oldPrice === 'number' && 
            typeof sub.currentPrice === 'number'
        );
    });

    if (competitorsWithPriceChanges.length === 0) {
        pricingContainer.innerHTML = '<div class="empty-state">No competitors with historical pricing data available for detailed comparison.</div>';
    }
    
    // Render each competitor's pricing section (only for those with price changes for the detailed tables)
    // If competitorsWithPriceChanges is empty, this loop won't run, which is correct.
    competitorsWithPriceChanges.forEach(competitor => {
        // Calculate average price change percentage based only on models with numeric old and current prices
        let totalChangePercent = 0;
        let changeCount = 0;
        
        const modelsForAvgCalculation = competitor.subscriptionModels.filter(sub => 
            typeof sub.oldPrice === 'number' && sub.oldPrice > 0 &&
            typeof sub.currentPrice === 'number'
        );

        modelsForAvgCalculation.forEach(subscription => {
            const changePercent = ((subscription.currentPrice - subscription.oldPrice) / subscription.oldPrice) * 100;
            totalChangePercent += changePercent;
            changeCount++;
        });
        
        const avgChange = changeCount > 0 ? totalChangePercent / changeCount : 0;
        
        // Determine CSS class based on average change percentage
        let changeClass = 'neutral';
        if (avgChange > 1) {
            changeClass = 'positive';
        } else if (avgChange < -1) {
            changeClass = 'negative';
        }
        
        // Create pricing section element
        const section = document.createElement('div');
        section.className = 'pricing-section';
        section.dataset.country = competitor.country;
        section.dataset.competitor = competitor.id;
        
        // Create pricing header with competitor name and average change
        const header = document.createElement('div');
        header.className = 'pricing-header';
        header.innerHTML = `
            <h4>${competitor.name} <span class="country-badge">${competitor.country || ''}</span></h4>
            <span class="avg-change ${changeClass}">Average Change: ${avgChange.toFixed(2)}%</span>
        `;
        
        // Create pricing table
        const table = document.createElement('table');
        table.className = 'pricing-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Plan</th>
                    <th>Old Price</th>
                    <th>Current Price</th>
                    <th>% Change</th>
                    <th>Invoice</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${competitor.subscriptionModels.map((sub, index) => {
                    const isCurrentPriceCustom = sub.currentPrice === "-";
                    const isOldPriceCustom = sub.oldPrice === "-";
                    const hasNumericOldPrice = typeof sub.oldPrice === 'number' && sub.oldPrice > 0;
                    const hasNumericCurrentPrice = typeof sub.currentPrice === 'number';

                    const oldPriceDisplay = isOldPriceCustom ? "Custom" : (hasNumericOldPrice ? parseFloat(sub.oldPrice).toFixed(2) : 'N/A');
                    const currentPriceDisplay = isCurrentPriceCustom ? "Custom" : (hasNumericCurrentPrice ? parseFloat(sub.currentPrice).toFixed(2) : 'N/A');
                    
                    let changePercent = 0;
                    let changePercentDisplay = 'N/A';
                    let subChangeClass = 'neutral-change';

                    if (hasNumericOldPrice && hasNumericCurrentPrice) {
                        changePercent = ((sub.currentPrice - sub.oldPrice) / sub.oldPrice) * 100;
                        changePercentDisplay = `${changePercent.toFixed(2)}%`;
                        if (changePercent > 1) {
                            subChangeClass = 'positive-change';
                        } else if (changePercent < -1) {
                            subChangeClass = 'negative-change';
                        }
                    } else if (isOldPriceCustom || isCurrentPriceCustom) {
                        // If one is custom, change is N/A
                         subChangeClass = 'neutral-change'; // Or some other class to indicate custom
                    }
                    
                    // Format invoice information
                    const invoiceInfo = sub.invoiceAmount ? `€${sub.invoiceAmount.toFixed(2)} ${sub.invoiceFrequency || 'monthly'}` : 'N/A';
                    
                    // Format notes with expandable content - now with centered popup
                    const notesDisplay = sub.notes ? `<div class="notes-cell expandable-note">
                              <span class="note-preview">${sub.notes.substring(0, 30)}${sub.notes.length > 30 ? '...' : ''}</span>
                              <div class="note-full-content hidden">${sub.notes}</div>
                          </div>` : 'N/A';
                    
                    // Return table row HTML
                    return `
                        <tr>
                            <td>${sub.name || `Level ${index + 1}`}</td>
                            <td class="price-cell">€${oldPriceDisplay}</td>
                            <td class="price-cell">€${currentPriceDisplay}</td>
                            <td class="change-cell ${subChangeClass}">${changePercentDisplay}</td>
                            <td>${invoiceInfo}</td>
                            <td>${notesDisplay}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        // Append header and table to the section
        section.appendChild(header);
        section.appendChild(table);
        
        // Add the section to the pricing container
        pricingContainer.appendChild(section);
    });
    
    // Attach click events to expandable notes
    attachNoteToggleEvents();
    
    // Apply global filtering if active
    if (typeof globalFilterState !== 'undefined' && globalFilterState.isFilterActive) {
        // Use a small delay to ensure DOM is updated
        setTimeout(() => {
            applyGlobalFilters();
        }, 100);
    }
}

// Attach click events to note previews for expanding/collapsing notes
function attachNoteToggleEvents() {
    // Find all note previews
    const notePreviews = document.querySelectorAll('.note-preview');
    
    // Add click event listeners to all note previews
    notePreviews.forEach(preview => {
        preview.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Find the full note content container
            const fullNote = this.parentElement.querySelector('.note-full-content');
            
            if (fullNote) {
                // Clear any existing popups
                const existingPopups = document.querySelectorAll('.note-popup-container');
                existingPopups.forEach(popup => popup.remove());
                
                // Create a new centered popup
                const popupContainer = document.createElement('div');
                popupContainer.className = 'note-popup-container';
                
                // Create backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'note-backdrop';
                
                // Create content
                const popupContent = document.createElement('div');
                popupContent.className = 'note-full-content';
                popupContent.innerHTML = fullNote.innerHTML;
                
                // Add to DOM
                popupContainer.appendChild(backdrop);
                popupContainer.appendChild(popupContent);
                document.body.appendChild(popupContainer);
                
                // Add close event to backdrop
                backdrop.addEventListener('click', function() {
                    popupContainer.remove();
                });
            }
        });
    });
    
    // Close popups when clicking Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const popups = document.querySelectorAll('.note-popup-container');
            popups.forEach(popup => popup.remove());
        }
    });
}
