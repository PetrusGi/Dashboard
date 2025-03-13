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

// Function to calculate market standard lead magnets
function calculateMarketStandardLeadMagnets(competitors, allLeadMagnets) {
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
            .filter(lm => lm && !standardLeadMagnets.some(s => s.name === lm))
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

// Function to ensure Market Standard Lead Magnets list is populated
function renderMarketStandardLeadMagnets(marketStandardLeadMagnets) {
    const marketStandardList = document.getElementById('market-standard-leadmagnets-list');
    if (!marketStandardList) return;
    
    marketStandardList.innerHTML = '';
    
    if (!marketStandardLeadMagnets || !Array.isArray(marketStandardLeadMagnets) || marketStandardLeadMagnets.length === 0) {
        marketStandardList.innerHTML = '<li class="empty-item">No market standard lead magnets found</li>';
        return;
    }
    
    marketStandardLeadMagnets.forEach((leadMagnet, index) => {
        if (index < 5) { // Show top 5
            const li = document.createElement('li');
            li.innerHTML = `${leadMagnet.name} <span class="adoption">${leadMagnet.adoption}% adoption</span>`;
            marketStandardList.appendChild(li);
        }
    });
}

// Render all Lead Magnets with enhanced analytics
function renderLeadMagnets(leadMagnets) {
    console.log("Rendering Lead Magnets...", leadMagnets && leadMagnets.length);
    
    const leadMagnetList = document.getElementById('leadmagnet-list');
    if (!leadMagnetList) {
        console.error("Lead magnet list container not found");
        return;
    }
    
    leadMagnetList.innerHTML = '';
    
    if (!leadMagnets || !Array.isArray(leadMagnets) || leadMagnets.length === 0) {
        leadMagnetList.innerHTML = '<div class="empty-state">No lead magnets available</div>';
        return;
    }
    
    // Get competitor data to count usage and analyze
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
                (competitors.reduce((sum, comp) => sum + (comp.leadMagnets ? comp.leadMagnets.length : 0), 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-leadmagnets').textContent = totalLeadMagnets;
            document.getElementById('avg-leadmagnets').textContent = avgLeadMagnets;
            
            // Get top and least used lead magnets
            const sortedLeadMagnets = [...leadMagnets].sort((a, b) => 
                (leadMagnetCounts[b] || 0) - (leadMagnetCounts[a] || 0));
            
            const topLeadMagnets = sortedLeadMagnets.slice(0, 5);
            const leastLeadMagnets = sortedLeadMagnets.slice(-5).reverse();
            
            // Find the Lead Magnet leader
            const leader = getLeadMagnetLeader(competitors);
            
            // Find unique Lead Magnets
            const uniqueLeadMagnets = findUniqueLeadMagnets(competitors, leadMagnets);
            
            // Calculate market standard Lead Magnets
            const marketStandardLeadMagnets = calculateMarketStandardLeadMagnets(competitors, leadMagnets);
            
            // Update the dashboard stats content
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
                `;
            }
            
            // Render market standard Lead Magnets
            renderMarketStandardLeadMagnets(marketStandardLeadMagnets);
            
            // Render unique Lead Magnets
            const uniqueLeadMagnetsList = document.getElementById('unique-leadmagnets-list');
            if (uniqueLeadMagnetsList) {
                uniqueLeadMagnetsList.innerHTML = '';
                uniqueLeadMagnets.slice(0, 5).forEach(leadMagnet => {
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet.name} <span class="exclusive">Only in ${leadMagnet.competitor}</span>`;
                    uniqueLeadMagnetsList.appendChild(li);
                });
            }
            
            // Move search and add button to list header
            const leadmagnetListHeader = document.querySelector('#leadmagnets-tab .list-header');
            const tabActions = document.querySelector('#leadmagnets-tab .tab-actions');
            
            if (leadmagnetListHeader && tabActions) {
                // Keep the original "All Lead Magnets" title
                const title = leadmagnetListHeader.querySelector('h4').outerHTML;
                
                // Get the search input and add button from tab actions
                const searchInput = tabActions.querySelector('#leadmagnet-search');
                const addButton = tabActions.querySelector('#add-leadmagnet-btn');
                
                // Create new header content
                leadmagnetListHeader.innerHTML = `
                    ${title}
                    <div class="list-header-actions">
                        <input type="text" id="leadmagnet-search" placeholder="Search lead magnets...">
                        <button id="add-leadmagnet-btn" class="action-btn">Add Lead Magnet</button>
                    </div>
                `;
                
                // Setup search functionality
                const newSearchInput = document.getElementById('leadmagnet-search');
                if (newSearchInput) {
                    newSearchInput.addEventListener('input', () => {
                        const searchTerm = newSearchInput.value.toLowerCase();
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
                
                // Setup add Lead Magnet button
                const newAddButton = leadmagnetListHeader.querySelector('#add-leadmagnet-btn');
                if (newAddButton) {
                    newAddButton.addEventListener('click', addNewLeadMagnet);
                }
                
                // Remove elements from tab actions
                if (searchInput) searchInput.remove();
                if (addButton) addButton.remove();
                
                // Hide tab actions if empty
                if (tabActions.children.length === 0) {
                    tabActions.style.display = 'none';
                }
            }
            
            // Render top lead magnets
            const topLeadMagnetsList = document.getElementById('top-leadmagnets-list');
            if (topLeadMagnetsList) {
                topLeadMagnetsList.innerHTML = '';
                topLeadMagnets.forEach(leadMagnet => {
                    const count = leadMagnetCounts[leadMagnet] || 0;
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                    topLeadMagnetsList.appendChild(li);
                });
            }
            
            // Render least used lead magnets
            const leastLeadMagnetsList = document.getElementById('least-leadmagnets-list');
            if (leastLeadMagnetsList) {
                leastLeadMagnetsList.innerHTML = '';
                leastLeadMagnets.forEach(leadMagnet => {
                    const count = leadMagnetCounts[leadMagnet] || 0;
                    const li = document.createElement('li');
                    li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                    leastLeadMagnetsList.appendChild(li);
                });
            }
            
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
                const editBtn = leadMagnetItem.querySelector('.edit-leadmagnet-btn');
                const deleteBtn = leadMagnetItem.querySelector('.delete-leadmagnet-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editLeadMagnet(leadMagnet);
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteLeadMagnet(leadMagnet);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error fetching competitors data:", error);
            leadMagnetList.innerHTML = `<div class="error-state">Error loading competitors data: ${error.message}</div>`;
        });
}
