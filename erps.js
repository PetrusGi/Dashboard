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

// Calculate which competitor has implemented the most ERPs
function getERPLeader(competitors) {
    if (!competitors || competitors.length === 0) return null;
    
    let maxERPs = 0;
    let leader = null;
    
    competitors.forEach(competitor => {
        if (!competitor.erps || !Array.isArray(competitor.erps)) {
            return; // Skip if erps is not an array
        }
        
        if (competitor.erps.length > maxERPs) {
            maxERPs = competitor.erps.length;
            leader = competitor;
        }
    });
    
    if (!leader) return null;
    
    return {
        name: leader.name || "Unknown",
        count: maxERPs,
        country: leader.country || ""
    };
}

// Find unique ERPs (implemented by only one competitor)
function findUniqueERPs(competitors, allERPs) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allERPs || !Array.isArray(allERPs) || allERPs.length === 0) {
        return [];
    }
    
    const erpsMap = {};
    
    // Initialize count for all ERPs
    allERPs.forEach(erp => {
        if (erp) {
            erpsMap[erp] = {
                count: 0,
                competitor: null
            };
        }
    });
    
    // Count ERP usage across competitors
    competitors.forEach(competitor => {
        if (!competitor || !competitor.erps || !Array.isArray(competitor.erps)) {
            return; // Skip invalid competitors
        }
        
        competitor.erps.forEach(erp => {
            if (erp && erpsMap[erp]) {
                erpsMap[erp].count += 1;
                if (erpsMap[erp].count === 1) {
                    erpsMap[erp].competitor = competitor.name || "Unknown";
                }
            }
        });
    });
    
    // Filter for unique ERPs
    const uniqueERPs = allERPs.filter(erp => 
        erp && erpsMap[erp] && erpsMap[erp].count === 1
    ).map(erp => ({
        name: erp,
        competitor: erpsMap[erp].competitor
    }));
    
    return uniqueERPs;
}

// Function to calculate market standard ERPs
function calculateMarketStandardERPs(competitors, allERPs) {
    if (!competitors || !Array.isArray(competitors) || competitors.length === 0 || 
        !allERPs || !Array.isArray(allERPs) || allERPs.length === 0) {
        return [];
    }
    
    const erpsMap = {};
    const validCompetitors = competitors.filter(comp => comp && comp.erps && Array.isArray(comp.erps));
    
    if (validCompetitors.length === 0) return [];
    
    // For small numbers of competitors, lower the threshold
    const thresholdPercentage = validCompetitors.length < 5 ? 0.3 : 0.5; // 30% for small samples, 50% otherwise
    const threshold = Math.ceil(validCompetitors.length * thresholdPercentage);
    
    // Initialize count for all ERPs
    allERPs.forEach(erp => {
        if (erp) {
            erpsMap[erp] = 0;
        }
    });
    
    // Count ERP usage across competitors
    validCompetitors.forEach(competitor => {
        competitor.erps.forEach(erp => {
            if (erp && erpsMap[erp] !== undefined) {
                erpsMap[erp] += 1;
            }
        });
    });
    
    // Filter for market standard ERPs
    const standardERPs = allERPs.filter(erp => 
        erp && erpsMap[erp] >= threshold
    ).map(erp => ({
        name: erp,
        adoption: Math.round((erpsMap[erp] / validCompetitors.length) * 100)
    }));
    
    // Make sure we return at least a few items
    if (standardERPs.length < 3 && allERPs.length > 0) {
        // If we don't have enough standard ERPs, add the most common ones
        const topERPs = [...allERPs]
            .filter(e => e && !standardERPs.some(s => s.name === e))
            .sort((a, b) => (erpsMap[b] || 0) - (erpsMap[a] || 0))
            .slice(0, 5 - standardERPs.length)
            .map(erp => ({
                name: erp,
                adoption: Math.round((erpsMap[erp] / validCompetitors.length) * 100)
            }));
        
        return [...standardERPs, ...topERPs].sort((a, b) => b.adoption - a.adoption);
    }
    
    return standardERPs.sort((a, b) => b.adoption - a.adoption);
}

// Function to ensure Market Standard ERPs list is populated
function renderMarketStandardERPs(marketStandardERPs) {
    const marketStandardList = document.getElementById('market-standard-erps-list');
    if (!marketStandardList) return;
    
    marketStandardList.innerHTML = '';
    
    if (!marketStandardERPs || !Array.isArray(marketStandardERPs) || marketStandardERPs.length === 0) {
        marketStandardList.innerHTML = '<li class="empty-item">No market standard ERPs found</li>';
        return;
    }
    
    marketStandardERPs.forEach((erp, index) => {
        if (index < 5) { // Show top 5
            const li = document.createElement('li');
            li.innerHTML = `${erp.name} <span class="adoption">${erp.adoption}% adoption</span>`;
            marketStandardList.appendChild(li);
        }
    });
}

// Render all ERPs with enhanced analytics
function renderERPs(erps) {
    console.log("Rendering ERPs...", erps && erps.length);
    
    const erpList = document.getElementById('erp-list');
    if (!erpList) {
        console.error("ERP list container not found");
        return;
    }
    
    erpList.innerHTML = '';
    
    if (!erps || !Array.isArray(erps) || erps.length === 0) {
        erpList.innerHTML = '<div class="empty-state">No ERPs available</div>';
        return;
    }
    
    // Get competitor data to count usage and analyze
    fetchData('competitors.json')
        .then(competitors => {
            // Count ERP usage
            const erpCounts = {};
            competitors.forEach(competitor => {
                if (!competitor.erps) return;
                competitor.erps.forEach(erp => {
                    erpCounts[erp] = (erpCounts[erp] || 0) + 1;
                });
            });
            
            // Calculate total ERPs and average per competitor
            const totalERPs = erps.length;
            const avgERPs = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + (comp.erps ? comp.erps.length : 0), 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-erps').textContent = totalERPs;
            document.getElementById('avg-erps').textContent = avgERPs;
            
            // Get top and least used ERPs
            const sortedERPs = [...erps].sort((a, b) => 
                (erpCounts[b] || 0) - (erpCounts[a] || 0));
            
            const topERPs = sortedERPs.slice(0, 5);
            const leastERPs = sortedERPs.slice(-5).reverse();
            
            // Find the ERP leader
            const leader = getERPLeader(competitors);
            
            // Find unique ERPs
            const uniqueERPs = findUniqueERPs(competitors, erps);
            
            // Calculate market standard ERPs
            const marketStandardERPs = calculateMarketStandardERPs(competitors, erps);
            
            // Update the dashboard stats content
            const dashboardStats = document.querySelector('#erp-tab .dashboard-stats');
            if (dashboardStats) {
                dashboardStats.innerHTML = `
                    <div class="stat-card">
                        <h4>Market Standard ERPs</h4>
                        <ul id="market-standard-erps-list" class="stats-list"></ul>
                    </div>
                    <div class="stat-card">
                        <h4>Unique ERPs</h4>
                        <ul id="unique-erps-list" class="stats-list"></ul>
                    </div>
                    <div class="stat-card" id="erp-leader-card">
                        <h4>ERP Leader</h4>
                        <div class="leader-content">
                            ${leader ? `
                            <div class="leader-info">
                                <span class="leader-name">${leader.name}</span>
                                <span class="leader-country">${leader.country}</span>
                            </div>
                            <div class="leader-stats">
                                <span class="leader-count">${leader.count}</span>
                                <span class="leader-label">ERPs Integrated</span>
                            </div>
                            ` : '<p>No leader found</p>'}
                        </div>
                    </div>
                    <div class="stat-card">
                        <h4>ERP Usage Stats</h4>
                        <div id="erp-stats-container" class="stats-content">
                            <p><strong>Total ERPs:</strong> <span id="total-erps">${totalERPs}</span></p>
                            <p><strong>Average ERPs per Competitor:</strong> <span id="avg-erps">${avgERPs}</span></p>
                        </div>
                    </div>
                `;
            }
            
            // Render market standard ERPs
            renderMarketStandardERPs(marketStandardERPs);
            
            // Render unique ERPs
            const uniqueERPsList = document.getElementById('unique-erps-list');
            if (uniqueERPsList) {
                uniqueERPsList.innerHTML = '';
                uniqueERPs.slice(0, 5).forEach(erp => {
                    const li = document.createElement('li');
                    li.innerHTML = `${erp.name} <span class="exclusive">Only in ${erp.competitor}</span>`;
                    uniqueERPsList.appendChild(li);
                });
            }
            
            // Move search and add button to list header
            const erpListHeader = document.querySelector('#erp-tab .list-header');
            const tabActions = document.querySelector('#erp-tab .tab-actions');
            
            if (erpListHeader && tabActions) {
                // Keep the original "All ERP Integrations" title
                const title = erpListHeader.querySelector('h4').outerHTML;
                
                // Get the search input and add button from tab actions
                const searchInput = tabActions.querySelector('#erp-search');
                const addButton = tabActions.querySelector('#add-erp-btn');
                
                // Create new header content
                erpListHeader.innerHTML = `
                    ${title}
                    <div class="list-header-actions">
                        <input type="text" id="erp-search" placeholder="Search ERPs...">
                        <button id="add-erp-btn" class="action-btn">Add ERP</button>
                    </div>
                `;
                
                // Setup search functionality
                const newSearchInput = document.getElementById('erp-search');
                if (newSearchInput) {
                    newSearchInput.addEventListener('input', () => {
                        const searchTerm = newSearchInput.value.toLowerCase();
                        const erpItems = document.querySelectorAll('#erp-list .list-item');
                        
                        erpItems.forEach(item => {
                            const text = item.querySelector('.list-item-name').textContent.toLowerCase();
                            if (text.includes(searchTerm)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                }
                
                // Setup add ERP button
                const newAddButton = erpListHeader.querySelector('#add-erp-btn');
                if (newAddButton) {
                    newAddButton.addEventListener('click', addNewERP);
                }
                
                // Remove elements from tab actions
                if (searchInput) searchInput.remove();
                if (addButton) addButton.remove();
                
                // Hide tab actions if empty
                if (tabActions.children.length === 0) {
                    tabActions.style.display = 'none';
                }
            }
            
            // Render top ERPs list
            const topERPsList = document.getElementById('top-erps-list');
            if (topERPsList) {
                topERPsList.innerHTML = '';
                topERPs.forEach(erp => {
                    const count = erpCounts[erp] || 0;
                    const li = document.createElement('li');
                    li.innerHTML = `${erp} <span class="count">${count}</span>`;
                    topERPsList.appendChild(li);
                });
            }
            
            // Render least used ERPs list
            const leastERPsList = document.getElementById('least-erps-list');
            if (leastERPsList) {
                leastERPsList.innerHTML = '';
                leastERPs.forEach(erp => {
                    const count = erpCounts[erp] || 0;
                    const li = document.createElement('li');
                    li.innerHTML = `${erp} <span class="count">${count}</span>`;
                    leastERPsList.appendChild(li);
                });
            }
            
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
                const editBtn = erpItem.querySelector('.edit-erp-btn');
                const deleteBtn = erpItem.querySelector('.delete-erp-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editERP(erp);
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteERP(erp);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error fetching competitors data:", error);
            erpList.innerHTML = `<div class="error-state">Error loading competitors data: ${error.message}</div>`;
        });
}
