// pricing.js - Functions for handling pricing-related functionality

// Render pricing data for all competitors
function renderPricing(competitors) {
    const pricingContainer = document.getElementById('pricing-container');
    pricingContainer.innerHTML = '';
    
    // Extract all unique countries from competitors
    const countries = [...new Set(competitors.map(comp => comp.country))];
    
    // Setup the country filter functionality
    setupCountryFilter(countries, competitors);
    
    // Sort competitors alphabetically by name
    const sortedCompetitors = [...competitors].sort((a, b) => a.name.localeCompare(b.name));
    
    // Render each competitor's pricing section
    sortedCompetitors.forEach(competitor => {
        if (!competitor.subscriptionModels || competitor.subscriptionModels.length === 0) {
            return;
        }
        
        // Calculate average price change percentage
        let totalChangePercent = 0;
        let changeCount = 0;
        competitor.subscriptionModels.forEach(subscription => {
            if (subscription.oldPrice) {
                const changePercent = ((subscription.currentPrice - subscription.oldPrice) / subscription.oldPrice) * 100;
                totalChangePercent += changePercent;
                changeCount++;
            }
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
                    const oldPrice = sub.oldPrice || sub.currentPrice;
                    const changePercent = sub.oldPrice ? ((sub.currentPrice - sub.oldPrice) / sub.oldPrice) * 100 : 0;
                    
                    // Determine CSS class for price change
                    let subChangeClass = 'neutral-change';
                    if (changePercent > 1) {
                        subChangeClass = 'positive-change';
                    } else if (changePercent < -1) {
                        subChangeClass = 'negative-change';
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
                            <td class="price-cell">€${parseFloat(oldPrice).toFixed(2)}</td>
                            <td class="price-cell">€${parseFloat(sub.currentPrice).toFixed(2)}</td>
                            <td class="change-cell ${subChangeClass}">${changePercent.toFixed(2)}%</td>
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
}

// Setup country filter functionality
function setupCountryFilter(countries, competitors) {
    const filterBtn = document.getElementById('country-filter-btn');
    const dropdown = document.getElementById('country-filter-dropdown');
    
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
    
    // Toggle dropdown visibility
    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Handle country filtering
    const countryCheckboxes = document.querySelectorAll('.country-filter');
    countryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.value === 'all') {
                // If "All Countries" is clicked, update all other checkboxes
                const isChecked = checkbox.checked;
                countryCheckboxes.forEach(cb => {
                    if (cb.value !== 'all') {
                        cb.checked = isChecked;
                    }
                });
            } else {
                // If a specific country is clicked, update the "All Countries" checkbox
                const allCheckbox = document.querySelector('.country-filter[value="all"]');
                const countryChecks = Array.from(document.querySelectorAll('.country-filter:not([value="all"])'));
                const allChecked = countryChecks.every(cb => cb.checked);
                
                allCheckbox.checked = allChecked;
            }
            
            // Filter pricing sections
            filterPricingSections();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== filterBtn) {
            dropdown.classList.remove('show');
        }
    });
    
    // Handle filtering of pricing sections
    function filterPricingSections() {
        const selectedCountries = Array.from(document.querySelectorAll('.country-filter:checked'))
            .map(cb => cb.value)
            .filter(value => value !== 'all');
        
        const allSelected = document.querySelector('.country-filter[value="all"]').checked;
        
        const pricingSections = document.querySelectorAll('.pricing-section');
        pricingSections.forEach(section => {
            const country = section.dataset.country;
            if (allSelected || selectedCountries.includes(country)) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
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
