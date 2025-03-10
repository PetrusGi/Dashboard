// Remove search and add button from tab header if they exist
            const tabActions = document.querySelector('#erp-tab .tab-actions');
            if (tabActions) {
                const erpSearch = tabActions.querySelector('#erp-search');
                const addERPButton = tabActions.querySelector('#add-erp-btn');
                
                if (erpSearch) erpSearch.remove();
                if (addERPButton) addERPButton.remove();
                
                // If tab actions is now empty, hide it
                if (tabActions.children.length === 0) {
                    tabActions.style.display = 'none';
                }
            }
            
            // Generate heatmap
            generateERPHeatmap(competitors, erps);
            
            // Create filter section (similar to features tab)
            const filterHeader = document.createElement('div');
            filterHeader.className = 'filter-header';
            filterHeader.innerHTML = `
                <h4>Filters</h4>
                <button id="erp-filter-toggle-btn" class="filter-toggle-btn">
                    <span class="material-icons filter-icon">filter_list</span>
                </button>
            `;
            
            const filterContainer = document.createElement('div');
            filterContainer.id = 'erp-filters';
            filterContainer.className = 'filter-container feature-filters';
            filterContainer.style.display = 'none'; // Hidden by default
            
            // Add filter section before the list
            const listContainer = document.querySelector('#erp-tab .list-container');
            if (listContainer) {
                listContainer.parentNode.insertBefore(filterHeader, listContainer);
                listContainer.parentNode.insertBefore(filterContainer, listContainer);
                
                // Setup filter toggle button (after elements are added to DOM)
                const filterToggleBtn = document.getElementById('erp-filter-toggle-btn');
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
            
            // Render all ERPs
            erps.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const adoption = Math.round((count / competitors.length) * 100);
                const isUnique = uniqueERPs.some(u => u.name === erp);
                const isStandard = marketStandard.some(s => s.name === erp);
                
                const erpItem = document.createElement('div');
                erpItem.className = 'list-item';
                erpItem.dataset.adoption = adoption;
                erpItem.dataset.unique = isUnique;
                erpItem.dataset.standard = isStandard;
                
                erpItem.innerHTML = `
                    <span class="list-item-name">${erp}</span>
                    <div class="feature-meta">
                        <span class="feature-adoption" title="Adoption rate">${adoption}%</span>
                        ${isUnique ? '<span class="feature-unique" title="Unique ERP">Unique</span>' : ''}
                        ${isStandard ? '<span class="feature-standard" title="Market standard">Standard</span>' : ''}
                    </div>
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
                erpItem.querySelector('.edit-erp-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editERP(erp);
                });
                
                erpItem.querySelector('.delete-erp-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteERP(erp);
                });
            });
        });
}// IMPORTANT: This function must be declared in global scope for main.js to access it
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
// Generate a ERP distribution heatmap
function renderERPs(erps) {
    const erpList = document.getElementById('erp-list');
    erpList.innerHTML = '';
    
    // Get competitor data to count usage
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
            
            // Calculate average ERPs per competitor
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
            
            // Find the competitor with the most ERPs (ERP Leader)
            const leader = getERPLeader(competitors);
            
            // Find unique ERPs
            const uniqueERPs = findUniqueERPs(competitors, erps);
            
            // Calculate market standard ERPs
            const marketStandard = calculateMarketStandard(competitors, erps);
            
            // Reorganize the visualizations container
            const visualizationsContainer = document.createElement('div');
            visualizationsContainer.className = 'visualizations-container';
            visualizationsContainer.innerHTML = `
                <div class="visualization-card full-width">
                    <h4>ERP Distribution Heatmap</h4>
                    <div id="erp-heatmap" class="chart-container">
                        <!-- Heatmap will be dynamically generated -->
                    </div>
                </div>
            `;
            
            // Insert visualizations container after dashboard stats
            const dashboardStatsElement = document.querySelector('#erp-tab .dashboard-stats');
            if (dashboardStatsElement && dashboardStatsElement.nextSibling) {
                dashboardStatsElement.parentNode.insertBefore(visualizationsContainer, dashboardStatsElement.nextSibling);
            }
            
            // Render market standard ERPs
            const marketStandardList = document.getElementById('market-standard-erps-list');
            if (marketStandardList) {
                marketStandardList.innerHTML = '';
                marketStandard.slice(0, 5).forEach(erp => {
                    const li = document.createElement('li');
                    li.innerHTML = `${erp.name} <span class="adoption">${erp.adoption}% adoption</span>`;
                    marketStandardList.appendChild(li);
                });
            }
            
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
            
            // Render top ERPs
            const topERPsList = document.getElementById('top-erps-list');
            topERPsList.innerHTML = '';
            topERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                topERPsList.appendChild(li);
            });
            
            // Render least used ERPs list (this is in a separate stat card)
            const leastERPsList = document.getElementById('least-erps-list');
            leastERPsList.innerHTML = '';
            leastERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                leastERPsList.appendChild(li);
            });
            
            // Reorganize the list header to include search and add button
            const listHeader = document.querySelector('#erp-tab .list-header');
            if (listHeader) {
                // Keep the original "All ERPs" title
                const title = '<h4>All ERP Integrations</h4>';
                
                // Recreate the header with search and add button
                listHeader.innerHTML = `
                    ${title}
                    <div class="list-header-actions">
                        <input type="text" id="erp-search" placeholder="Search ERPs...">
                        <button id="add-erp-btn" class="action-btn">Add ERP</button>
                    </div>
                `;
                
                // Setup search functionality
                const searchInput = document.getElementById('erp-search');
                if (searchInput) {
                    searchInput.addEventListener('input', () => {
                        const searchTerm = searchInput.value.toLowerCase();
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
                
                // Note: Event listener for add ERP button is set up in main.js
            }
