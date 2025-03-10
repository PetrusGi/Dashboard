// IMPORTANT: This function must be declared in global scope for main.js to access it
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

// Generate a lead magnet distribution heatmap
function generateLeadMagnetHeatmap(competitors, topLeadMagnets) {
    const heatmapContainer = document.getElementById('leadmagnet-heatmap');
    if (!heatmapContainer) return;
    
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 ||
        !topLeadMagnets || !Array.isArray(topLeadMagnets) || topLeadMagnets.length === 0) {
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
    const validCompetitors = competitors.filter(comp => comp && comp.leadMagnets && Array.isArray(comp.leadMagnets));
    const sortedCompetitors = [...validCompetitors]
        .sort((a, b) => b.leadMagnets.length - a.leadMagnets.length);
    
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
    topLeadMagnets.forEach(leadMagnet => {
        if (!leadMagnet) return;
        
        const leadMagnetName = typeof leadMagnet === 'object' ? leadMagnet.name : leadMagnet;
        
        const row = document.createElement('tr');
        row.innerHTML = `<td>${leadMagnetName}</td>`;
        
        sortedCompetitors.forEach(competitor => {
            if (!competitor.leadMagnets) {
                row.innerHTML += `<td class="no-feature"></td>`;
                return;
            }
            
            const hasLeadMagnet = competitor.leadMagnets.includes(leadMagnetName);
            row.innerHTML += `<td class="${hasLeadMagnet ? 'has-feature' : 'no-feature'}">${hasLeadMagnet ? '✓' : ''}</td>`;
        });
        
        table.appendChild(row);
    });
    
    scrollableContainer.appendChild(table);
    heatmapContainer.appendChild(scrollableContainer);
}

// Calculate which competitor has implemented the most lead magnets
function getLeadMagnetLeader(competitors) {
    if (!competitors || competitors.length === 0) return null;
    
    let maxLeadMagnets = 0;
    let leader = null;
    
    competitors.forEach(competitor => {
        if (!competitor.leadMagnets || !Array.isArray(competitor.leadMagnets)) {
            return; // Skip if leadMagnets is not an array
        }
        
        if (competitor.leadMagnets.length > maxLeadMagnets) {
            maxLeadMagnets = competitor.leadMagnets.length;
            leader = competitor;
        }
    });
    
    if (!leader) return null;
    
    return {
        name: leader.name || "Unknown",
        count: maxLeadMagnets,
        country: leader.country || ""
    };
}

// Find unique lead magnets (implemented by only one competitor)
function findUniqueLeadMagnets(competitors, allLeadMagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allLeadMagnets || !Array.isArray(allLeadMagnets) || allLeadMagnets.length === 0) {
        return [];
    }
    
    const leadMagnetsMap = {};
    
    // Initialize count for all lead magnets
    allLeadMagnets.forEach(leadMagnet => {
        if (leadMagnet) {
            leadMagnetsMap[leadMagnet] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count lead magnet usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.leadMagnets || !Array.isArray(competitor.leadMagnets)) {
            return; // Skip invalid competitors
        }
        
        competitor.leadMagnets.forEach(leadMagnet => {
            if (leadMagnet && leadMagnetsMap[leadMagnet]) {
                leadMagnetsMap[leadMagnet].count += 1;
                if (leadMagnetsMap[leadMagnet].count === 1) {
                    leadMagnetsMap[leadMagnet].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique lead magnets
    const uniqueLeadMagnets = allLeadMagnets.filter(leadMagnet => 
        leadMagnet && leadMagnetsMap[leadMagnet] && leadMagnetsMap[leadMagnet].count === 1
    ).map(leadMagnet => ({
        name: leadMagnet,
        competitor: leadMagnetsMap[leadMagnet].competitor
    }));
    
    return uniqueLeadMagnets;
}

// Calculate market standard lead magnets
function calculateMarketStandard(competitors, allLeadMagnets) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allLeadMagnets || !Array.isArray(allLeadMagnets) || allLeadMagnets.length === 0) {
        return [];
    }
    
    const leadMagnetsMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.leadMagnets && Array.isArray(comp.leadMagnets));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all lead magnets
    allLeadMagnets.forEach(leadMagnet => {
        if (leadMagnet) {
            leadMagnetsMap[leadMagnet] = 0;
        }
    });
    
    // Count lead magnet usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.leadMagnets.forEach(leadMagnet => {
            if (leadMagnet && leadMagnetsMap[leadMagnet] !== undefined) {
                leadMagnetsMap[leadMagnet] += 1;
            }
        });
    });
    
    // Filter for market standard lead magnets
    const standardLeadMagnets = allLeadMagnets.filter(leadMagnet => 
        leadMagnet && leadMagnetsMap[leadMagnet] >= threshold
    ).map(leadMagnet => ({
        name: leadMagnet,
        adoption: Math.round((leadMagnetsMap[leadMagnet] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardLeadMagnets.length < 3 && allLeadMagnets.length > 0) {
        // If we don't have enough standard lead magnets, add the most common ones
        const topLeadMagnets = [...allLeadMagnets]
            .filter(f => f && !standardLeadMagnets.some(sf => sf.name === f))
            .sort((a, b) => (leadMagnetsMap[b] || 0) - (leadMagnetsMap[a] || 0))
            .slice(0, 5 - standardLeadMagnets.length)
            .map(leadMagnet => ({
                name: leadMagnet,
                adoption: Math.round((leadMagnetsMap[leadMagnet] / validCompetitors.length) * 100)
            }));
        
        return [...standardLeadMagnets, ...topLeadMagnets].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardLeadMagnets.sort((a, b) => b.adoption - a.adoption);
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
                if (!competitor.leadMagnets) return;
                competitor.leadMagnets.forEach(leadMagnet => {
                    leadMagnetCounts[leadMagnet] = (leadMagnetCounts[leadMagnet] || 0) + 1;
                });
            });
            
            // Calculate average lead magnets per competitor
            const totalLeadMagnets = leadMagnets.length;
            const avgLeadMagnets = competitors.length ? 
                (competitors.reduce((sum, comp => sum + (comp.leadMagnets ? comp.leadMagnets.length : 0)), 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-leadmagnets').textContent = totalLeadMagnets;
            document.getElementById('avg-leadmagnets').textContent = avgLeadMagnets;
            
            // Get top and least used lead magnets
            const sortedLeadMagnets = [...leadMagnets].sort((a, b) => 
                (leadMagnetCounts[b] || 0) - (leadMagnetCounts[a] || 0));
            
            const topLeadMagnets = sortedLeadMagnets.slice(0, 5);
            const leastLeadMagnets = sortedLeadMagnets.slice(-5).reverse();
            
            // Find the competitor with the most lead magnets (Lead Magnet Leader)
            const leader = getLeadMagnetLeader(competitors);
            
            // Find unique lead magnets
            const uniqueLeadMagnets = findUniqueLeadMagnets(competitors, leadMagnets);
            
            // Calculate market standard lead magnets
            const marketStandard = calculateMarketStandard(competitors, leadMagnets);
            
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
                            <p><strong>Total Lead Magnets:</strong> <span id="total-leadmagnets">${totalLeadMagnets}</span></p>
                            <p><strong>Average per Competitor:</strong> <span id="avg-leadmagnets">${avgLeadMagnets}</span></p>
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
                marketStandard.slice(0, 5).forEach(leadMagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet.name} <span class="adoption">${leadMagnet.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            }
            
            // Render unique lead magnets
            const uniqueLeadMagnetsList = document.getElementById('unique-leadmagnets-list');
            if (uniqueLeadMagnetsList) {
                uniqueLeadMagnetsList.innerHTML = '';
                uniqueLeadMagnets.slice(0, 5).forEach(leadMagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet.name} <span class="exclusive">Only in ${leadMagnet.competitor}</span>`;
                    uniqueLeadMagnetsList.appendChild(li);
                });
            }
            
            // Render top lead magnets
            const topLeadMagnetsList = document.getElementById('top-leadmagnets-list');
            topLeadMagnetsList.innerHTML = '';
            topLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                topLeadMagnetsList.appendChild(li);
            });
            
            // Render least used lead magnets list (this is in a separate stat card)
            const leastLeadMagnetsList = document.getElementById('least-leadmagnets-list');
            leastLeadMagnetsList.innerHTML = '';
            leastLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                leastLeadMagnetsList.appendChild(li);
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
                        const leadMagnetItems = document.querySelectorAll('#leadmagnet-list .list-item');
                        
                        leadMagnetItems.forEach(item => {
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
                const leadMagnetSearch = tabActions.querySelector('#leadmagnet-search');
                const addLeadMagnetButton = tabActions.querySelector('#add-leadmagnet-btn');
                
                if (leadMagnetSearch) leadMagnetSearch.remove();
                if (addLeadMagnetButton) addLeadMagnetButton.remove();
                
                // If tab actions is now empty, hide it
                if (tabActions.children.length === 0) {
                    tabActions.style.display = 'none';
                }
            }
            
            // Generate heatmap
            generateLeadMagnetHeatmap(competitors, leadMagnets);
            
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
            leadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const adoption = Math.round((count / competitors.length) * 100);
                const isUnique = uniqueLeadMagnets.some(u => u.name === leadMagnet);
                const isStandard = marketStandard.some(s => s.name === leadMagnet);
                
                const leadMagnetItem = document.createElement('div');
                leadMagnetItem.className = 'list-item';
                leadMagnetItem.dataset.adoption = adoption;
                leadMagnetItem.dataset.unique = isUnique;
                leadMagnetItem.dataset.standard = isStandard;
                
                leadMagnetItem.innerHTML = `
                    <span class="list-item-name">${leadMagnet}</span>
                    <div class="feature-meta">
                        <span class="feature-adoption" title="Adoption rate">${adoption}%</span>
                        ${isUnique ? '<span class="feature-unique" title="Unique lead magnet">Unique</span>' : ''}
                        ${isStandard ? '<span class="feature-standard" title="Market standard">Standard</span>' : ''}
                    </div>
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
