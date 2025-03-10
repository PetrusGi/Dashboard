// IMPORTANT: This function must be declared in global scope for main.js to access it
function addNewleadmagnet() {
    const leadmagnetName = prompt("Enter new lead magnet name:");
    if (leadmagnetName && leadmagnetName.trim() !== '') {
        // First check if the lead magnet already exists
        fetchData('leadmagnets.json')
            .then(leadmagnets => {
                if (leadmagnets.includes(leadmagnetName)) {
                    alert(`Lead magnet "${leadmagnetName}" already exists.`);
                    return;
                }
                
                // Add the new lead magnet
                leadmagnets.push(leadmagnetName);
                saveData('leadmagnets.json', leadmagnets)
                    .then(() => {
                        initializeData();
                        alert(`Lead magnet "${leadmagnetName}" added successfully.`);
                    })
                    .catch(error => {
                        console.error('Error saving lead magnet:', error);
                        alert('Failed to add lead magnet. Please try again.');
                    });
            });
    }
}

// Function to edit a lead magnet
function editleadmagnet(leadmagnet) {
    const newName = prompt(`Edit lead magnet: ${leadmagnet}`, leadmagnet);
    if (newName && newName !== leadmagnet) {
        // Update the lead magnet in the database
        updateItemName('leadmagnets.json', leadmagnet, newName)
            .then(() => {
                // Update the lead magnet in all competitors
                updateCompetitorItems('competitors.json', 'leadmagnets', leadmagnet, newName)
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
function deleteleadmagnet(leadmagnet) {
    if (confirm(`Are you sure you want to delete the lead magnet: ${leadmagnet}?`)) {
        // Delete the lead magnet from the database
        deleteItem('leadmagnets.json', leadmagnet)
            .then(() => {
                // Remove the lead magnet from all competitors
                removeItemFromCompetitors('competitors.json', 'leadmagnets', leadmagnet)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Lead magnet deleted: ${leadmagnet}`);
                    });
            })
            .catch(error => {
                console.error('Error deleting lead magnet:', error);
                alert('Failed to delete lead magnet. Please try again.');
            });
    }
}

// Generate a lead magnet distribution heatmap
function generateleadmagnetHeatmap(competitors, topleadmagnets) {
    const heatmapContainer = document.getElementById('leadmagnet-heatmap');
    if (!heatmapContainer) return;
    
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 ||
        !topleadmagnets || !Array.isArray(topleadmagnets) || topleadmagnets.length === 0) {
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
    headerRow.innerHTML = '<th>Lead Magnet</th>';
    
    // Get all competitors sorted by number of lead magnets
    const validCompetitors = competitors.filter(comp => comp && comp.leadmagnets && Array.isArray(comp.leadmagnets));
    const sortedCompetitors = [...validCompetitors]
        .sort((a, b) => b.leadmagnets.length - a.leadmagnets.length);
    
    if (sortedCompetitors.length === 0) {
        heatmapContainer.innerHTML = '<div class="no-data">No competitor data available</div>';
        return;
    }
    
    sortedCompetitors.forEach(competitor => {
        // Set a width for each competitor column to ensure table is wide enough for scrolling
        headerRow.innerHTML += `<th style="min-width: 100px;">${competitor.name || 'Unknown'}</th>`;
    });
    
    table.appendChild(headerRow);
    
    // Create rows for each lead magnet
    topleadmagnets.forEach(leadmagnet => {
        if (!leadmagnet) return;
        
        const leadmagnetName = typeof leadmagnet === 'object' ? leadmagnet.name : leadmagnet;
        
        const row = document.createElement('tr');
        row.innerHTML = `<td>${leadmagnetName}</td>`;
        
        sortedCompetitors.forEach(competitor => {
            if (!competitor.leadmagnets) {
                row.innerHTML += `<td class="no-feature"></td>`;
                return;
            }
            
            const hasleadmagnet = competitor.leadmagnets.includes(leadmagnetName);
            row.innerHTML += `<td class="${hasleadmagnet ? 'has-feature' : 'no-feature'}">${hasleadmagnet ? '✓' : ''}</td>`;
        });
        
        table.appendChild(row);
    });
    
    scrollableContainer.appendChild(table);
    heatmapContainer.appendChild(scrollableContainer);
}

// Calculate which competitor has implemented the most lead magnets
function getleadmagnetLeader(competitors) {
    if (!competitors || competitors.length === 0) return null;
    
    let maxleadmagnets = 0;
    let leader = null;
    
    competitors.forEach(competitor => {
        if (!competitor.leadmagnets || !Array.isArray(competitor.leadmagnets)) {
            return; // Skip if leadmagnets is not an array
        }
        
        if (competitor.leadmagnets.length > maxleadmagnets) {
            maxleadmagnets = competitor.leadmagnets.length;
            leader = competitor;
        }
    });
    
    if (!leader) return null;
    
    return {
        name: leader.name || "Unknown",
        count: maxleadmagnets,
        country: leader.country || ""
    };
}

// Find unique lead magnets (implemented by only one competitor)
function findUniqueleadmagnets(competitors, allleadmagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allleadmagnets || !Array.isArray(allleadmagnets) || allleadmagnets.length === 0) {
        return [];
    }
    
    const leadmagnetsMap = {};
    
    // Initialize count for all lead magnets
    allleadmagnets.forEach(leadmagnet => {
        if (leadmagnet) {
            leadmagnetsMap[leadmagnet] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count lead magnet usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.leadmagnets || !Array.isArray(competitor.leadmagnets)) {
            return; // Skip invalid competitors
        }
        
        competitor.leadmagnets.forEach(leadmagnet => {
            if (leadmagnet && leadmagnetsMap[leadmagnet]) {
                leadmagnetsMap[leadmagnet].count += 1;
                if (leadmagnetsMap[leadmagnet].count === 1) {
                    leadmagnetsMap[leadmagnet].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique lead magnets
    const uniqueleadmagnets = allleadmagnets.filter(leadmagnet => 
        leadmagnet && leadmagnetsMap[leadmagnet] && leadmagnetsMap[leadmagnet].count === 1
    ).map(leadmagnet => ({
        name: leadmagnet,
        competitor: leadmagnetsMap[leadmagnet].competitor
    }));
    
    return uniqueleadmagnets;
}

// Calculate market standard lead magnets
function calculateMarketStandard(competitors, allleadmagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allleadmagnets || !Array.isArray(allleadmagnets) || allleadmagnets.length === 0) {
        return [];
    }
    
    const leadmagnetsMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.leadmagnets && Array.isArray(comp.leadmagnets));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all lead magnets
    allleadmagnets.forEach(leadmagnet => {
        if (leadmagnet) {
            leadmagnetsMap[leadmagnet] = 0;
        }
    });
    
    // Count lead magnet usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.leadmagnets.forEach(leadmagnet => {
            if (leadmagnet && leadmagnetsMap[leadmagnet] !== undefined) {
                leadmagnetsMap[leadmagnet] += 1;
            }
        });
    });
    
    // Filter for market standard lead magnets
    const standardleadmagnets = allleadmagnets.filter(leadmagnet => 
        leadmagnet && leadmagnetsMap[leadmagnet] >= threshold
    ).map(leadmagnet => ({
        name: leadmagnet,
        adoption: Math.round((leadmagnetsMap[leadmagnet] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardleadmagnets.length < 3 && allleadmagnets.length > 0) {
        // If we don't have enough standard lead magnets, add the most common ones
        const topleadmagnets = [...allleadmagnets]
            .filter(f => f && !standardleadmagnets.some(sf => sf.name === f))
            .sort((a, b) => (leadmagnetsMap[b] || 0) - (leadmagnetsMap[a] || 0))
            .slice(0, 5 - standardleadmagnets.length)
            .map(leadmagnet => ({
                name: leadmagnet,
                adoption: Math.round((leadmagnetsMap[leadmagnet] / validCompetitors.length) * 100)
            }));
        
        return [...standardleadmagnets, ...topleadmagnets].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardleadmagnets.sort((a, b) => b.adoption - a.adoption);
}

function renderleadmagnets(leadmagnets) {
    const leadmagnetList = document.getElementById('leadmagnet-list');
    leadmagnetList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count lead magnet usage
            const leadmagnetCounts = {};
            competitors.forEach(competitor => {
                if (!competitor.leadmagnets) return;
                competitor.leadmagnets.forEach(leadmagnet => {
                    leadmagnetCounts[leadmagnet] = (leadmagnetCounts[leadmagnet] || 0) + 1;
                });
            });
            
            // Calculate average lead magnets per competitor
            const totalleadmagnets = leadmagnets.length;
            // Fix the error here - replace sum with a reducer function
            const avgleadmagnets = competitors.length ? 
                (competitors.reduce((acc, comp) => acc + (comp.leadmagnets ? comp.leadmagnets.length : 0), 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-leadmagnets').textContent = totalleadmagnets;
            document.getElementById('avg-leadmagnets').textContent = avgleadmagnets;
            
            // Get top and least used lead magnets
            const sortedleadmagnets = [...leadmagnets].sort((a, b) => 
                (leadmagnetCounts[b] || 0) - (leadmagnetCounts[a] || 0));
            
            const topleadmagnets = sortedleadmagnets.slice(0, 5);
            const leastleadmagnets = sortedleadmagnets.slice(-5).reverse();
            
            // Find the competitor with the most lead magnets (Lead Magnet Leader)
            const leader = getleadmagnetLeader(competitors);
            
            // Find unique lead magnets
            const uniqueleadmagnets = findUniqueleadmagnets(competitors, leadmagnets);
            
            // Calculate market standard lead magnets
            const marketStandard = calculateMarketStandard(competitors, leadmagnets);
            
            // Reorganize dashboard stats for layout
            const dashboardStats = document.querySelector('#leadmagnets-tab .dashboard-stats');
            if (dashboardStats) {
                dashboardStats.innerHTML = `
                    <div class="stat-card">
                        <h4>Market Standard Lead Magnets</h4>
                        <ul id="market-standard-leadmagnets-list" class="stats-list"></ul>
                    </div>
                    <div class="stat-card">
                        <h4>Unique Lead Magnets</h4>
                        <ul id="unique-leadmagnets-list" class="stats-list"></ul>
                    </div>
                    <div class="stat-card" id="leadmagnet-leader-card">
                        <h4>Lead Magnet Leader</h4>
                        <div class="leader-content">
                            ${leader ? `
                            <div class="leader-info">
                                <span class="leader-name">${leader.name}</span>
                                <span class="leader-country">${leader.country}</span>
                            </div>
                            <div class="leader-stats">
                                <span class="leader-count">${leader.count}</span>
                                <span class="leader-label">Lead Magnets Used</span>
                            </div>
                            ` : '<p>No leader found</p>'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4>Lead Magnet Usage Stats</h4>
                        <div id="leadmagnet-stats-container" class="stats-content">
                            <p><strong>Total Lead Magnets:</strong> <span id="total-leadmagnets">${totalleadmagnets}</span></p>
                            <p><strong>Average per Competitor:</strong> <span id="avg-leadmagnets">${avgleadmagnets}</span></p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4>Top Used Lead Magnets</h4>
                        <ul id="top-leadmagnets-list" class="stats-list"></ul>
                    </div>
                `;
            }
            
            // Reorganize the visualizations container
            const visualizationsContainer = document.createElement('div');
            visualizationsContainer.className = 'visualizations-container';
            visualizationsContainer.innerHTML = `
                <div class="visualization-card full-width">
                    <h4>Lead Magnet Distribution Heatmap</h4>
                    <div id="leadmagnet-heatmap" class="chart-container">
                        <!-- Heatmap will be dynamically generated -->
                    </div>
                </div>
            `;
            
            // Insert visualizations container after dashboard stats
            const dashboardStatsElement = document.querySelector('#leadmagnets-tab .dashboard-stats');
            if (dashboardStatsElement && dashboardStatsElement.nextSibling) {
                dashboardStatsElement.parentNode.insertBefore(visualizationsContainer, dashboardStatsElement.nextSibling);
            }
            
            // Render market standard lead magnets
            const marketStandardList = document.getElementById('market-standard-leadmagnets-list');
            if (marketStandardList) {
                marketStandardList.innerHTML = '';
                marketStandard.slice(0, 5).forEach(leadmagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadmagnet.name} <span class="adoption">${leadmagnet.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            }
            
            // Render unique lead magnets
            const uniqueleadmagnetsList = document.getElementById('unique-leadmagnets-list');
            if (uniqueleadmagnetsList) {
                uniqueleadmagnetsList.innerHTML = '';
                uniqueleadmagnets.slice(0, 5).forEach(leadmagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadmagnet.name} <span class="exclusive">Only in ${leadmagnet.competitor}</span>`;
                    uniqueleadmagnetsList.appendChild(li);
                });
            }
            
            // Render top lead magnets
            const topleadmagnetsList = document.getElementById('top-leadmagnets-list');
            topleadmagnetsList.innerHTML = '';
            topleadmagnets.forEach(leadmagnet => {
                const count = leadmagnetCounts[leadmagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadmagnet} <span class="count">${count}</span>`;
                topleadmagnetsList.appendChild(li);
            });
            
            // Render least used lead magnets list (this is in a separate stat card)
            const leastleadmagnetsList = document.getElementById('least-leadmagnets-list');
            leastleadmagnetsList.innerHTML = '';
            leastleadmagnets.forEach(leadmagnet => {
                const count = leadmagnetCounts[leadmagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadmagnet} <span class="count">${count}</span>`;
                leastleadmagnetsList.appendChild(li);
            });
            
            // Reorganize the list header to include search and add button
            const listHeader = document.querySelector('#leadmagnets-tab .list-header');
            if (listHeader) {
                // Keep the original "All Lead Magnets" title
                const title = '<h4>All Lead Magnets</h4>';
                
                // Recreate the header with search and add button
                listHeader.innerHTML = `
                    ${title}
                    <div class="list-header-actions">
                        <input type="text" id="leadmagnet-search" placeholder="Search lead magnets...">
                        <button id="add-leadmagnet-btn" class="action-btn">Add Lead Magnet</button>
                    </div>
                `;
                
                // Setup search functionality
                const searchInput = document.getElementById('leadmagnet-search');
                if (searchInput) {
                    searchInput.addEventListener('input', () => {
                        const searchTerm = searchInput.value.toLowerCase();
                        const leadmagnetItems = document.querySelectorAll('#leadmagnet-list .list-item');
                        
                        leadmagnetItems.forEach(item => {
                            const text = item.querySelector('.list-item-name').textContent.toLowerCase();
                            if (text.includes(searchTerm)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                }
                
                // Note: Event listener for add lead magnet button is set up in main.js
            }
            
            // Remove search and add button from tab header if they exist
            const tabActions = document.querySelector('#leadmagnets-tab .tab-actions');
            if (tabActions) {
                const leadmagnetSearch = tabActions.querySelector('#leadmagnet-search');
                const addleadmagnetButton = tabActions.querySelector('#add-leadmagnet-btn');
                
                if (leadmagnetSearch) leadmagnetSearch.remove();
                if (addleadmagnetButton) addleadmagnetButton.remove();
                
                // If tab actions is now empty, hide it
                if (tabActions.children.length === 0) {
                    tabActions.style.display = 'none';
                }
            }
            
            // Generate heatmap
            generateleadmagnetHeatmap(competitors, leadmagnets);
            
            // Create filter section (similar to features tab)
            const filterHeader = document.createElement('div');
            filterHeader.className = 'filter-header';
            filterHeader.innerHTML = `
                <h4>Filters</h4>
                <button id="leadmagnet-filter-toggle-btn" class="filter-toggle-btn">
                    <span class="material-icons filter-icon">filter_list</span>
                </button>
            `;
            
            const filterContainer = document.createElement('div');
            filterContainer.id = 'leadmagnet-filters';
            filterContainer.className = 'filter-container feature-filters';
            filterContainer.style.display = 'none'; // Hidden by default
            
            // Add filter section before the list
            const listContainer = document.querySelector('#leadmagnets-tab .list-container');
            if (listContainer) {
                listContainer.parentNode.insertBefore(filterHeader, listContainer);
                listContainer.parentNode.insertBefore(filterContainer, listContainer);
                
                // Setup filter toggle button (after elements are added to DOM)
                const filterToggleBtn = document.getElementById('leadmagnet-filter-toggle-btn');
                if (filterToggleBtn) {
                    filterToggleBtn.addEventListener('click', function() {
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
            
            // Render all lead magnets
            leadmagnets.forEach(leadmagnet => {
                const count = leadmagnetCounts[leadmagnet] || 0;
                const adoption = Math.round((count / competitors.length) * 100);
                const isUnique = uniqueleadmagnets.some(u => u.name === leadmagnet);
                const isStandard = marketStandard.some(s => s.name === leadmagnet);
                
                const leadmagnetItem = document.createElement('div');
                leadmagnetItem.className = 'list-item';
                leadmagnetItem.dataset.adoption = adoption;
                leadmagnetItem.dataset.unique = isUnique;
                leadmagnetItem.dataset.standard = isStandard;
                
                leadmagnetItem.innerHTML = `
                    <span class="list-item-name">${leadmagnet}</span>
                    <div class="feature-meta">
                        <span class="feature-adoption" title="Adoption rate">${adoption}%</span>
                        ${isUnique ? '<span class="feature-unique" title="Unique lead magnet">Unique</span>' : ''}
                        ${isStandard ? '<span class="feature-standard" title="Market standard">Standard</span>' : ''}
                    </div>
                    <span class="list-item-count">${count}</span>
                    <div class="list-item-actions">
                        <button title="Edit" class="edit-leadmagnet-btn" data-leadmagnet="${leadmagnet}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button title="Delete" class="delete-leadmagnet-btn" data-leadmagnet="${leadmagnet}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                leadmagnetList.appendChild(leadmagnetItem);
                
                // Add event listeners for edit and delete
                leadmagnetItem.querySelector('.edit-leadmagnet-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editleadmagnet(leadmagnet);
                });
                
                leadmagnetItem.querySelector('.delete-leadmagnet-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteleadmagnet(leadmagnet);
                });
            });
        });
}
