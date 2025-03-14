// enhanced-heatmap.js - Improves the feature distribution heatmap

document.addEventListener('DOMContentLoaded', function() {
    console.log("Enhancing feature heatmap...");
    
    // Override the generateFeatureHeatmap function
    window.generateFeatureHeatmap = function(competitors, topFeatures) {
        const heatmapContainer = document.getElementById('feature-heatmap');
        if (!heatmapContainer) return;
        
        if (!competitors || !Array.isArray(competitors) || competitors.length === 0 ||
            !topFeatures || !Array.isArray(topFeatures) || topFeatures.length === 0) {
            heatmapContainer.innerHTML = '<div class="no-data">Insufficient data for heatmap</div>';
            return;
        }
        
        // Apply global filtering if active
        if (typeof globalFilterState !== 'undefined' && globalFilterState.isFilterActive) {
            // Filter competitors based on selected countries
            competitors = competitors.filter(comp => 
                comp && comp.country && globalFilterState.countries.includes(comp.country)
            );
            
            // If no competitors match the filter, show a message
            if (competitors.length === 0) {
                heatmapContainer.innerHTML = '<div class="no-data">No competitors match the current filter</div>';
                return;
            }
        }
        
        heatmapContainer.innerHTML = '';
        
        // Add expand button at the top
        const expandButtonContainer = document.createElement('div');
        expandButtonContainer.className = 'heatmap-expand-container';
        expandButtonContainer.innerHTML = `
            <button class="expand-heatmap-btn" title="Open in new window">
                <span class="material-icons">open_in_new</span>
                <span>Open Full View</span>
            </button>
        `;
        heatmapContainer.appendChild(expandButtonContainer);
        
        // Create a scrollable container
        const scrollableContainer = document.createElement('div');
        scrollableContainer.className = 'heatmap-scrollable-container';
        
        // Create a table for the heatmap
        const table = document.createElement('table');
        table.className = 'heatmap-table';
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
            headerRow.innerHTML += `<th>${competitor.name || 'Unknown'}</th>`;
        });
        
        table.appendChild(headerRow);
        
        // Create rows for each feature
        topFeatures.forEach(feature => {
            if (!feature) return;
            
            const featureName = typeof feature === 'object' ? feature.name : feature;
            
            const row = document.createElement('tr');
            
            // First cell with feature name
            const featureCell = document.createElement('td');
            featureCell.className = 'feature-name-cell';
            featureCell.innerHTML = `<span class="feature-name">${featureName}</span>`;
            row.appendChild(featureCell);
            
            // Add cells for each competitor
            sortedCompetitors.forEach(competitor => {
                const cell = document.createElement('td');
                
                if (!competitor.features) {
                    cell.className = 'no-feature';
                    row.appendChild(cell);
                    return;
                }
                
                const hasFeature = competitor.features.includes(featureName);
                cell.className = hasFeature ? 'has-feature' : 'no-feature';
                
                if (hasFeature) {
                    cell.innerHTML = '<span class="material-icons check-icon">done</span>';
                }
                
                row.appendChild(cell);
            });
            
            table.appendChild(row);
        });
        
        scrollableContainer.appendChild(table);
        heatmapContainer.appendChild(scrollableContainer);
        
        // Add event listener to the expand button
        const expandBtn = heatmapContainer.querySelector('.expand-heatmap-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showFullHeatmap(topFeatures, sortedCompetitors);
            });
        }
        
        // Add CSS for the enhanced heatmap
        addEnhancedHeatmapStyles();
    };
    
    // Function to open the full heatmap in a new window
    function showFullHeatmap(topFeatures, competitors) {
        try {
            console.log("Opening full heatmap view...");
            console.log("Features:", topFeatures);
            console.log("Competitors:", competitors);
            
            // Prepare data to pass to the new window
            const data = {
                features: topFeatures,
                competitors: competitors,
                // Include global filter state if available
                globalFilter: typeof globalFilterState !== 'undefined' ? {
                    countries: globalFilterState.countries,
                    isFilterActive: globalFilterState.isFilterActive,
                    allCountriesSelected: globalFilterState.allCountriesSelected
                } : null
            };
            
            // Encode data as URL parameter
            const encodedData = encodeURIComponent(JSON.stringify(data));
            console.log("Encoded data length:", encodedData.length);
            
            // Use URL parameter method for smaller datasets
            if (encodedData.length < 2000) {
                console.log("Using URL parameter method");
                window.open(`heatmap-fullscreen.html?data=${encodedData}`, '_blank');
                return;
            }
            
            // For larger datasets, use localStorage to temporarily store the data
            console.log("Using localStorage method for large dataset");
            const timestamp = new Date().getTime();
            const storageKey = `heatmap_data_${timestamp}`;
            
            // Store the data in localStorage
            localStorage.setItem(storageKey, JSON.stringify(data));
            
            // Open the window with a reference to the localStorage key
            const newWindow = window.open(`heatmap-fullscreen.html?storage_key=${storageKey}`, '_blank');
            
            // Check if the window was blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                console.error('Popup window was blocked. Please allow popups for this site.');
                alert('The full view window was blocked by your browser. Please allow popups for this site and try again.');
                // Clean up localStorage
                localStorage.removeItem(storageKey);
            }
            
            // Clean up localStorage after 1 minute
            setTimeout(() => {
                localStorage.removeItem(storageKey);
                console.log(`Cleaned up localStorage key: ${storageKey}`);
            }, 60000);
            
        } catch (error) {
            console.error('Error opening full heatmap view:', error);
            
            // Fallback method - just open the page without data
            try {
                console.log("Trying fallback method...");
                window.open('heatmap-fullscreen.html', '_blank');
                console.log("Fallback window opened without data");
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
                alert('Could not open the full view. Please check your browser settings and try again.');
            }
        }
    }
    
    // Add CSS styles for the enhanced heatmap
    function addEnhancedHeatmapStyles() {
        const styleId = 'enhanced-heatmap-styles';
        
        // Only add styles once
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Enhanced heatmap styles */
            .heatmap-expand-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 10px;
            }
            
            .expand-heatmap-btn {
                background-color: var(--secondary-color);
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: var(--primary-color);
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 6px 12px;
                font-size: 0.9rem;
                font-weight: 500;
                transition: all 0.2s ease;
            }
            
            .expand-heatmap-btn:hover {
                background-color: var(--secondary-hover);
                transform: translateY(-1px);
            }
            
            .expand-heatmap-btn .material-icons {
                font-size: 18px;
            }
            
            .heatmap-scrollable-container {
                width: 100%;
                overflow-x: auto;
                max-height: 400px;
                overflow-y: auto;
                border: 1px solid var(--secondary-color);
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .heatmap-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9rem;
            }
            
            .heatmap-table th {
                padding: 12px 15px;
                text-align: center;
                background-color: #f5f4f8;
                position: sticky;
                top: 0;
                z-index: 1;
                border-bottom: 2px solid #e0e0e5;
                font-weight: 600;
            }
            
            .heatmap-table th:first-child {
                text-align: left;
                position: sticky;
                left: 0;
                z-index: 3;
                background-color: #f5f4f8;
            }
            
            .heatmap-table td {
                padding: 12px 15px;
                text-align: center;
                border-bottom: 1px solid #eee;
                transition: background-color 0.2s ease;
                height: 40px;
                width: 100px;
                min-width: 100px;
                max-width: 100px;
            }
            
            .heatmap-table td:first-child {
                position: sticky;
                left: 0;
                z-index: 2;
                background-color: #f5f4f8;
                text-align: left;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 250px;
                border-right: 1px solid #e0e0e5;
            }
            
            .heatmap-table tr:hover {
                background-color: var(--secondary-hover);
            }
            
            .heatmap-table .has-feature {
                background-color: var(--primary-color);
                color: var(--white);
                font-weight: bold;
            }
            
            .heatmap-table .no-feature {
                background-color: var(--white);
            }
            
            .heatmap-table .check-icon {
                font-size: 18px;
            }
            
            /* Feature detail popup styles */
            .feature-detail-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .feature-detail-content {
                background-color: var(--white);
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                animation: fadeIn 0.2s ease;
            }
            
            .feature-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid var(--secondary-color);
                background-color: #f5f4f8;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            
            .feature-detail-header h4 {
                margin: 0;
                color: var(--primary-color);
                font-size: 1.2rem;
            }
            
            .close-feature-detail {
                font-size: 1.5rem;
                color: var(--light-text);
                cursor: pointer;
                transition: color 0.2s ease;
            }
            
            .close-feature-detail:hover {
                color: var(--primary-color);
            }
            
            .feature-detail-body {
                padding: 20px;
            }
            
            .feature-detail-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--dark-text);
                margin-bottom: 15px;
                line-height: 1.4;
                word-break: break-word;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Function to show feature details in a separate popup
    function showFeatureDetails(featureName) {
        // Close any existing feature detail popups
        const existingPopups = document.querySelectorAll('.feature-detail-popup');
        existingPopups.forEach(popup => popup.remove());
        
        // Create popup container
        const popupContainer = document.createElement('div');
        popupContainer.className = 'feature-detail-popup';
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'feature-detail-content';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'feature-detail-header';
        header.innerHTML = `
            <h4>Feature Details</h4>
            <span class="close-feature-detail">&times;</span>
        `;
        
        // Create body
        const body = document.createElement('div');
        body.className = 'feature-detail-body';
        body.innerHTML = `
            <div class="feature-detail-name">${featureName}</div>
        `;
        
        // Assemble popup
        popupContent.appendChild(header);
        popupContent.appendChild(body);
        popupContainer.appendChild(popupContent);
        
        // Add to DOM
        document.body.appendChild(popupContainer);
        
        // Position the popup in the center of the screen
        const popup = document.querySelector('.feature-detail-popup');
        popup.style.display = 'flex';
        
        // Add event listeners
        const closeBtn = popup.querySelector('.close-feature-detail');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                popup.remove();
            });
        }
        
        // Close on click outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        });
    }
    
    // Force re-render of features to apply the enhanced heatmap
    setTimeout(function() {
        // Check if features data is available
        fetchData('features.json')
            .then(features => {
                if (features && Array.isArray(features)) {
                    // Re-render features to apply the enhanced heatmap
                    renderFeatures(features);
                }
            })
            .catch(error => {
                console.error("Error fetching features data:", error);
            });
    }, 500);
});
