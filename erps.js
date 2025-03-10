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


function renderERPs(erps) {
    const erpList = document.getElementById('erp-list');
    erpList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count ERP usage
            const erpCounts = {};
            competitors.forEach(competitor => {
                competitor.erps.forEach(erp => {
                    erpCounts[erp] = (erpCounts[erp] || 0) + 1;
                });
            });
            
            // Calculate average ERPs per competitor
            const totalERPs = erps.length;
            const avgERPs = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.erps.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-erps').textContent = totalERPs;
            document.getElementById('avg-erps').textContent = avgERPs;
            
            // Get top and least used ERPs
            const sortedERPs = [...erps].sort((a, b) => 
                (erpCounts[b] || 0) - (erpCounts[a] || 0));
            
            const topERPs = sortedERPs.slice(0, 5);
            const leastERPs = sortedERPs.slice(-5).reverse();
            
            // Render top ERPs
            const topERPsList = document.getElementById('top-erps-list');
            topERPsList.innerHTML = '';
            topERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                topERPsList.appendChild(li);
            });
            
            // Render least used ERPs
            const leastERPsList = document.getElementById('least-erps-list');
            leastERPsList.innerHTML = '';
            leastERPs.forEach(erp => {
                const count = erpCounts[erp] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${erp} <span class="count">${count}</span>`;
                leastERPsList.appendChild(li);
            });
            
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
}
