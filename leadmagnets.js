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


function renderLeadMagnets(leadMagnets) {
    const leadMagnetList = document.getElementById('leadmagnet-list');
    leadMagnetList.innerHTML = '';
    
    // Get competitor data to count usage
    fetchData('competitors.json')
        .then(competitors => {
            // Count lead magnet usage
            const leadMagnetCounts = {};
            competitors.forEach(competitor => {
                competitor.leadMagnets.forEach(leadMagnet => {
                    leadMagnetCounts[leadMagnet] = (leadMagnetCounts[leadMagnet] || 0) + 1;
                });
            });
            
            // Calculate average lead magnets per competitor
            const totalLeadMagnets = leadMagnets.length;
            const avgLeadMagnets = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.leadMagnets.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            // Update stats
            document.getElementById('total-leadmagnets').textContent = totalLeadMagnets;
            document.getElementById('avg-leadmagnets').textContent = avgLeadMagnets;
            
            // Get top and least used lead magnets
            const sortedLeadMagnets = [...leadMagnets].sort((a, b) => 
                (leadMagnetCounts[b] || 0) - (leadMagnetCounts[a] || 0));
            
            const topLeadMagnets = sortedLeadMagnets.slice(0, 5);
            const leastLeadMagnets = sortedLeadMagnets.slice(-5).reverse();
            
            // Render top lead magnets
            const topLeadMagnetsList = document.getElementById('top-leadmagnets-list');
            topLeadMagnetsList.innerHTML = '';
            topLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                topLeadMagnetsList.appendChild(li);
            });
            
            // Render least used lead magnets
            const leastLeadMagnetsList = document.getElementById('least-leadmagnets-list');
            leastLeadMagnetsList.innerHTML = '';
            leastLeadMagnets.forEach(leadMagnet => {
                const count = leadMagnetCounts[leadMagnet] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${leadMagnet} <span class="count">${count}</span>`;
                leastLeadMagnetsList.appendChild(li);
            });
            
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