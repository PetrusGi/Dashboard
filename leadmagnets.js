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
