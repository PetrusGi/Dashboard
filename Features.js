// --- Existing Functions for Feature Management ---

// Function to add new features
function addNewFeature() {
    const featureName = prompt("Enter new feature name:");
    if (featureName && featureName.trim() !== '') {
        // First check if the feature already exists
        fetchData('features.json')
            .then(features => {
                if (features.includes(featureName)) {
                    alert(`Feature "${featureName}" already exists.`);
                    return;
                }
                
                // Add the new feature
                features.push(featureName);
                saveData('features.json', features)
                    .then(() => {
                        initializeData();
                        alert(`Feature "${featureName}" added successfully.`);
                    })
                    .catch(error => {
                        console.error('Error saving feature:', error);
                        alert('Failed to add feature. Please try again.');
                    });
            });
    }
}


// Function to edit a feature
function editFeature(feature) {
    const newName = prompt(`Edit feature: ${feature}`, feature);
    if (newName && newName !== feature) {
        // Update the feature in the database
        updateItemName('features.json', feature, newName)
            .then(() => {
                // Update the feature in all competitors
                updateCompetitorItems('competitors.json', 'features', feature, newName)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Feature renamed to: ${newName}`);
                    });
            })
            .catch(error => {
                console.error('Error updating feature:', error);
                alert('Failed to update feature. Please try again.');
            });
    }
}

// Function to delete a feature
function deleteFeature(feature) {
    if (confirm(`Are you sure you want to delete the feature: ${feature}?`)) {
        // Delete the feature from the database
        deleteItem('features.json', feature)
            .then(() => {
                // Remove the feature from all competitors
                removeItemFromCompetitors('competitors.json', 'features', feature)
                    .then(() => {
                        // Refresh the data
                        initializeData();
                        alert(`Feature deleted: ${feature}`);
                    });
            })
            .catch(error => {
                console.error('Error deleting feature:', error);
                alert('Failed to delete feature. Please try again.');
            });
    }
}


// --- Data Analysis Functions ---

// Identify feature categories based on co-occurrence
function identifyFeatureCategories(competitors) {
    const featurePairs = {};
    const featureOccurrences = {};
    
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureOccurrences[feature] = (featureOccurrences[feature] || 0) + 1;
            competitor.features.forEach(otherFeature => {
                if (feature !== otherFeature) {
                    const pair = [feature, otherFeature].sort().join('|||');
                    featurePairs[pair] = (featurePairs[pair] || 0) + 1;
                }
            });
        });
    });
    
    const correlations = [];
    for (const pair in featurePairs) {
        const [feature1, feature2] = pair.split('|||');
        const correlation = featurePairs[pair] / Math.sqrt(featureOccurrences[feature1] * featureOccurrences[feature2]);
        if (correlation > 0.5 && featurePairs[pair] > 1) {
            correlations.push({
                source: feature1,
                target: feature2,
                weight: correlation,
                count: featurePairs[pair]
            });
        }
    }
    
    return correlations.sort((a, b) => b.weight - a.weight);
}

// Find unique features (implemented by only one competitor)
function findUniqueFeatures(competitors, features) {
    const featureCounts = {};
    const uniqueFeatures = {};
    
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
            if (featureCounts[feature] === 1) {
                uniqueFeatures[feature] = competitor.name;
            } else {
                delete uniqueFeatures[feature];
            }
        });
    });
    
    return Object.entries(uniqueFeatures).map(([feature, competitor]) => ({
        feature,
        competitor
    }));
}

// Determine "market standard" features (implemented by the majority of competitors)
function findMarketStandardFeatures(competitors, features) {
    const featureCounts = {};
    const totalCompetitors = competitors.length;
    
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
    });
    
    const standardFeatures = Object.entries(featureCounts)
        .filter(([_, count]) => count >= totalCompetitors * 0.5)
        .map(([feature, count]) => ({
            feature,
            count,
            percentage: Math.round((count / totalCompetitors) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage);
    
    return standardFeatures;
}

// Identify which competitor has the most features
function findFeatureLeader(competitors) {
    if (!competitors || competitors.length === 0) return null;
    
    return competitors
        .map(competitor => ({
            name: competitor.name,
            country: competitor.country,
            featureCount: competitor.features.length
        }))
        .sort((a, b) => b.featureCount - a.featureCount)[0];
}


// --- Visualization Functions ---

// Create and render the feature distribution heatmap
function renderFeatureHeatmap(competitors, features) {
    const heatmapContainer = document.getElementById('feature-heatmap-container');
    if (!heatmapContainer) return;
    heatmapContainer.innerHTML = '';
    
    const table = document.createElement('table');
    table.className = 'feature-heatmap';
    
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th class="feature-label">Feature</th>';
    
    const sortedCompetitors = [...competitors].sort((a, b) => a.name.localeCompare(b.name));
    sortedCompetitors.forEach(competitor => {
        const th = document.createElement('th');
        th.className = 'competitor-label';
        th.setAttribute('title', competitor.name);
        th.textContent = competitor.name.substring(0, 3);
        headerRow.appendChild(th);
    });
    
    const thead = document.createElement('thead');
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    const featureCounts = {};
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
    });
    
    const sortedFeatures = Object.keys(featureCounts)
        .sort((a, b) => featureCounts[b] - featureCounts[a]);
    
    sortedFeatures.forEach(feature => {
        const row = document.createElement('tr');
        const featureCell = document.createElement('td');
        featureCell.className = 'feature-label';
        featureCell.textContent = feature;
        row.appendChild(featureCell);
        
        sortedCompetitors.forEach(competitor => {
            const cell = document.createElement('td');
            const hasFeature = competitor.features.includes(feature);
            cell.className = hasFeature ? 'has-feature' : 'no-feature';
            cell.setAttribute('title', `${competitor.name}: ${hasFeature ? 'Yes' : 'No'}`);
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    heatmapContainer.appendChild(table);
    
    const filterContainer = document.createElement('div');
    filterContainer.className = 'heatmap-filters';
    filterContainer.innerHTML = `
        <div class="filter-group">
            <label for="feature-filter">Filter features:</label>
            <input type="text" id="feature-filter" placeholder="Type to filter features...">
        </div>
        <div class="filter-group">
            <label>Show features:</label>
            <select id="feature-adoption-filter">
                <option value="all">All features</option>
                <option value="common">Common features (>50%)</option>
                <option value="rare">Rare features (<25%)</option>
                <option value="unique">Unique features</option>
            </select>
        </div>
    `;
    heatmapContainer.insertBefore(filterContainer, table);
    
    const featureFilter = document.getElementById('feature-filter');
    const adoptionFilter = document.getElementById('feature-adoption-filter');
    
    featureFilter.addEventListener('input', filterHeatmap);
    adoptionFilter.addEventListener('change', filterHeatmap);
    
    function filterHeatmap() {
        const searchText = featureFilter.value.toLowerCase();
        const adoptionType = adoptionFilter.value;
        const totalCompetitors = competitors.length;
        const featureRows = tbody.querySelectorAll('tr');
        
        featureRows.forEach(row => {
            const featureCell = row.querySelector('.feature-label');
            const featureName = featureCell.textContent.toLowerCase();
            const featureCount = featureCounts[featureCell.textContent] || 0;
            const adoptionRate = featureCount / totalCompetitors;
            let showByAdoption = true;
            
            switch(adoptionType) {
                case 'common':
                    showByAdoption = adoptionRate >= 0.5;
                    break;
                case 'rare':
                    showByAdoption = adoptionRate < 0.25;
                    break;
                case 'unique':
                    showByAdoption = featureCount === 1;
                    break;
            }
            
            if (featureName.includes(searchText) && showByAdoption) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Create and render the feature network graph using a force-directed layout
function renderFeatureNetwork(correlations) {
    const container = document.getElementById('feature-network-container');
    if (!container || correlations.length === 0) return;
    container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'feature-network');
    svg.setAttribute('viewBox', '0 0 800 600');
    
    const nodes = [];
    const links = [];
    const nodeMap = {};
    
    correlations.forEach(correlation => {
        if (!nodeMap[correlation.source]) {
            nodeMap[correlation.source] = nodes.length;
            nodes.push({ id: correlation.source, count: 0 });
        }
        if (!nodeMap[correlation.target]) {
            nodeMap[correlation.target] = nodes.length;
            nodes.push({ id: correlation.target, count: 0 });
        }
        
        nodes[nodeMap[correlation.source]].count += correlation.count;
        nodes[nodeMap[correlation.target]].count += correlation.count;
        
        links.push({
            source: nodeMap[correlation.source],
            target: nodeMap[correlation.target],
            value: correlation.weight
        });
    });
    
    const simulation = {
        nodes,
        links,
        alpha: 0.1,
        iterations: 100,
        width: 800,
        height: 600,
        nodeRadius: 5,
        maxNodeRadius: 15,
        repulsion: 1000,
        linkDistance: 100
    };
    
    nodes.forEach(node => {
        node.x = Math.random() * simulation.width;
        node.y = Math.random() * simulation.height;
        node.vx = 0;
        node.vy = 0;
    });
    
    for (let i = 0; i < simulation.iterations; i++) {
        nodes.forEach(node => {
            nodes.forEach(otherNode => {
                if (node !== otherNode) {
                    const dx = node.x - otherNode.x;
                    const dy = node.y - otherNode.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = simulation.repulsion / (distance * distance);
                    node.vx += dx * force * simulation.alpha;
                    node.vy += dy * force * simulation.alpha;
                }
            });
            node.vx += (simulation.width / 2 - node.x) * 0.01 * simulation.alpha;
            node.vy += (simulation.height / 2 - node.y) * 0.01 * simulation.alpha;
        });
        
        links.forEach(link => {
            const source = nodes[link.source];
            const target = nodes[link.target];
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (distance - simulation.linkDistance) * 0.05 * simulation.alpha;
            const strengthFactor = link.value * 2;
            
            source.vx += dx * force * strengthFactor;
            source.vy += dy * force * strengthFactor;
            target.vx -= dx * force * strengthFactor;
            target.vy -= dy * force * strengthFactor;
        });
        
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            node.vx *= 0.9;
            node.vy *= 0.9;
            node.x = Math.max(50, Math.min(simulation.width - 50, node.x));
            node.y = Math.max(50, Math.min(simulation.height - 50, node.y));
        });
        
        simulation.alpha *= 0.99;
    }
    
    const maxCount = Math.max(...nodes.map(node => node.count));
    
    links.forEach(link => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x);
        line.setAttribute('y1', source.y);
        line.setAttribute('x2', target.x);
        line.setAttribute('y2', target.y);
        line.setAttribute('stroke', '#999');
        line.setAttribute('stroke-opacity', (0.2 + link.value * 0.8).toFixed(2));
        line.setAttribute('stroke-width', (1 + link.value * 3).toFixed(1));
        svg.appendChild(line);
    });
    
    nodes.forEach(node => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${node.x},${node.y})`);
        
        const radius = simulation.nodeRadius + ((simulation.maxNodeRadius - simulation.nodeRadius) * node.count / maxCount);
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', '#DC0028');
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', radius + 15);
        text.setAttribute('font-size', '10px');
        text.textContent = node.id;
        
        group.appendChild(circle);
        group.appendChild(text);
        group.setAttribute('class', 'feature-node');
        group.setAttribute('data-feature', node.id);
        svg.appendChild(group);
    });
    
    container.appendChild(svg);
    
    const legend = document.createElement('div');
    legend.className = 'network-legend';
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background-color:#DC0028;"></div>
            <span>Feature Node (size indicates prevalence)</span>
        </div>
        <div class="legend-item">
            <div class="legend-line"></div>
            <span>Features commonly found together (thickness indicates strength)</span>
        </div>
    `;
    container.appendChild(legend);
}

// Create and render the feature bar chart
function renderFeatureBarChart(competitors, features) {
    const container = document.getElementById('feature-chart-container');
    if (!container) return;
    container.innerHTML = '';
    
    const featureCounts = {};
    const totalCompetitors = competitors.length;
    competitors.forEach(competitor => {
        competitor.features.forEach(feature => {
            featureCounts[feature] = (featureCounts[feature] || 0) + 1;
        });
    });
    
    const topFeatures = Object.entries(featureCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([feature, count]) => ({
            feature,
            count,
            percentage: Math.round((count / totalCompetitors) * 100)
        }));
    
    const chart = document.createElement('div');
    chart.className = 'feature-bar-chart';
    
    const title = document.createElement('h4');
    title.textContent = 'Top Features by Adoption Rate';
    chart.appendChild(title);
    
    topFeatures.forEach(item => {
        const barContainer = document.createElement('div');
        barContainer.className = 'bar-container';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'bar-label';
        labelElement.textContent = item.feature;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        
        const barElement = document.createElement('div');
        barElement.className = 'bar';
        barElement.style.width = `${item.percentage}%`;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'bar-value';
        valueElement.textContent = `${item.percentage}%`;
        
        barWrapper.appendChild(barElement);
        barWrapper.appendChild(valueElement);
        barContainer.appendChild(labelElement);
        barContainer.appendChild(barWrapper);
        chart.appendChild(barContainer);
    });
    
    container.appendChild(chart);
}

// Main function to render features and update dashboard with visualizations
function renderFeatures(features) {
    const featureList = document.getElementById('feature-list');
    featureList.innerHTML = '';
    
    fetchData('competitors.json')
        .then(competitors => {
            const featureCounts = {};
            competitors.forEach(competitor => {
                competitor.features.forEach(feature => {
                    featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                });
            });
            
            const totalFeatures = features.length;
            const avgFeatures = competitors.length ? 
                (competitors.reduce((sum, comp) => sum + comp.features.length, 0) / competitors.length).toFixed(1) : 
                '0';
            
            document.getElementById('total-features').textContent = totalFeatures;
            document.getElementById('avg-features').textContent = avgFeatures;
            
            const featureLeader = findFeatureLeader(competitors);
            const uniqueFeatures = findUniqueFeatures(competitors, features);
            const marketStandardFeatures = findMarketStandardFeatures(competitors, features);
            const featureCorrelations = identifyFeatureCategories(competitors);
            
            updateFeatureDashboard(
                featureLeader, 
                uniqueFeatures, 
                marketStandardFeatures,
                featureCorrelations,
                competitors,
                features
            );
            
            const sortedFeatures = [...features].sort((a, b) => 
                (featureCounts[b] || 0) - (featureCounts[a] || 0)
            );
            const topFeatures = sortedFeatures.slice(0, 5);
            
            const topFeaturesList = document.getElementById('top-features-list');
            topFeaturesList.innerHTML = '';
            topFeatures.forEach(feature => {
                const count = featureCounts[feature] || 0;
                const li = document.createElement('li');
                li.innerHTML = `${feature} <span class="count">${count}</span>`;
                topFeaturesList.appendChild(li);
            });
            
            features.forEach(feature => {
                const count = featureCounts[feature] || 0;
                const isUnique = uniqueFeatures.some(uf => uf.feature === feature);
                const isMarketStandard = marketStandardFeatures.some(msf => msf.feature === feature);
                
                const featureItem = document.createElement('div');
                featureItem.className = 'list-item';
                
                if (isUnique) {
                    featureItem.classList.add('unique-feature');
                }
                if (isMarketStandard) {
                    featureItem.classList.add('standard-feature');
                }
                
                featureItem.innerHTML = `
                    <span class="list-item-name">${feature}</span>
                    <span class="list-item-count">${count}</span>
                    <div class="list-item-actions">
                        <button title="Edit" class="edit-feature-btn" data-feature="${feature}">
                            <span class="material-icons">edit</span>
                        </button>
                        <button title="Delete" class="delete-feature-btn" data-feature="${feature}">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                `;
                featureList.appendChild(featureItem);
                
                featureItem.querySelector('.edit-feature-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    editFeature(feature);
                });
                featureItem.querySelector('.delete-feature-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFeature(feature);
                });
            });
        });
}

// Update the feature dashboard with new visualizations and insights
function updateFeatureDashboard(
    featureLeader, 
    uniqueFeatures, 
    marketStandardFeatures,
    featureCorrelations,
    competitors,
    features
) {
    const dashboardStats = document.querySelector('#features-tab .dashboard-stats');
    if (!dashboardStats) return;
    
    dashboardStats.innerHTML = '';
    
    const leaderCard = document.createElement('div');
    leaderCard.className = 'stat-card';
    leaderCard.innerHTML = `
        <h4>Feature Leader</h4>
        <div class="feature-leader-content">
            ${featureLeader ? `
                <div class="leader-name">${featureLeader.name}</div>
                <div class="leader-country">${featureLeader.country}</div>
                <div class="leader-count">${featureLeader.featureCount} features</div>
            ` : 'No data available'}
        </div>
    `;
    dashboardStats.appendChild(leaderCard);
    
    const topFeaturesCard = document.createElement('div');
    topFeaturesCard.className = 'stat-card';
    topFeaturesCard.innerHTML = `
        <h4>Top Used Features</h4>
        <ul id="top-features-list" class="stats-list"></ul>
    `;
    dashboardStats.appendChild(topFeaturesCard);
    
    const standardFeaturesCard = document.createElement('div');
    standardFeaturesCard.className = 'stat-card';
    standardFeaturesCard.innerHTML = `
        <h4>Market Standard Features</h4>
        <div class="market-standard-content">
            ${marketStandardFeatures.length > 0 ? 
                `<ul class="stats-list">
                    ${marketStandardFeatures.slice(0, 5).map(item => `
                        <li>${item.feature} <span class="count">${item.percentage}%</span></li>
                    `).join('')}
                </ul>` : 
                '<p>No market standard features found</p>'
            }
        </div>
    `;
    dashboardStats.appendChild(standardFeaturesCard);
    
    const statsCard = document.createElement('div');
    statsCard.className = 'stat-card';
    statsCard.innerHTML = `
        <h4>Feature Usage Stats</h4>
        <div id="feature-stats-container" class="stats-content">
            <p><strong>Total Features:</strong> <span id="total-features">0</span></p>
            <p><strong>Average Features per Competitor:</strong> <span id="avg-features">0</span></p>
        </div>
    `;
    dashboardStats.appendChild(statsCard);
    
    const listContainer = document.querySelector('#features-tab .list-container');
    if (listContainer) {
        let uniqueFeaturesSection = document.getElementById('unique-features-section');
        if (!uniqueFeaturesSection) {
            uniqueFeaturesSection = document.createElement('div');
            uniqueFeaturesSection.id = 'unique-features-section';
            uniqueFeaturesSection.className = 'unique-features-section';
            const listHeader = listContainer.querySelector('.list-header');
            if (listHeader) {
                listHeader.parentNode.insertBefore(uniqueFeaturesSection, listHeader.nextSibling);
            } else {
                listContainer.prepend(uniqueFeaturesSection);
            }
        }
        
        uniqueFeaturesSection.innerHTML = `
            <div class="unique-features-header">
                <h4>Unique Features</h4>
                <span class="unique-count">${uniqueFeatures.length} features</span>
            </div>
            <div class="unique-features-content">
                ${uniqueFeatures.length > 0 ? 
                    `<div class="unique-features-grid">
                        ${uniqueFeatures.map(item => `
                            <div class="unique-feature-item">
                                <span class="unique-feature-name">${item.feature}</span>
                                <span class="unique-feature-company">Only in: ${item.competitor}</span>
                            </div>
                        `).join('')}
                    </div>` : 
                    '<p>No unique features found</p>'
                }
            </div>
        `;
        
        let featureLegend = document.getElementById('feature-list-legend');
        if (!featureLegend) {
            featureLegend = document.createElement('div');
            featureLegend.id = 'feature-list-legend';
            featureLegend.className = 'feature-list-legend';
            listContainer.appendChild(featureLegend);
        }
        
        featureLegend.innerHTML = `
            <div class="legend-item">
                <span class="legend-color unique-color"></span>
                <span class="legend-label">Unique feature</span>
            </div>
            <div class="legend-item">
                <span class="legend-color standard-color"></span>
                <span class="legend-label">Market standard feature</span>
            </div>
            <div class="legend-item">
                <span class="legend-color common-color"></span>
                <span class="legend-label">Common feature</span>
            </div>
        `;
    }
}

/* ------------------------- EXTENSION CODE START ------------------------- */

// Additional Interactive Filtering for Visualizations by Category/Importance
function setupCategoryFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const importanceFilter = document.getElementById('importance-filter');
    if (!categoryFilter || !importanceFilter) return;
    
    function filterVisualizations() {
        const selectedCategory = categoryFilter.value;
        const selectedImportance = importanceFilter.value;
        
        fetchData('competitors.json').then(competitors => {
            let filteredCompetitors = competitors;
            
            // Filter by category if applicable (assumes competitors have a "category" property)
            if (selectedCategory !== 'all') {
                filteredCompetitors = competitors.filter(comp => comp.category === selectedCategory);
            }
            
            // Re-render visualizations with filtered data
            renderFeatureHeatmap(filteredCompetitors);
            const correlations = identifyFeatureCategories(filteredCompetitors);
            renderFeatureNetwork(correlations);
            renderFeatureBarChart(filteredCompetitors);
        });
    }
    
    categoryFilter.addEventListener('change', filterVisualizations);
    importanceFilter.addEventListener('change', filterVisualizations);
}

// Function to update the "Market Standard" feature set UI
function updateMarketStandardUI(competitors, features) {
    const marketStandardFeatures = findMarketStandardFeatures(competitors, features);
    const marketStandardContainer = document.getElementById('market-standard-container');
    if (!marketStandardContainer) return;
    
    marketStandardContainer.innerHTML = `
        <h4>Market Standard Features</h4>
        ${marketStandardFeatures.length > 0 
            ? `<ul class="stats-list">
                    ${marketStandardFeatures.map(item => `
                        <li>${item.feature} <span class="count">${item.percentage}%</span></li>
                    `).join('')}
               </ul>`
            : '<p>No market standard features found</p>'
        }
    `;
}

/* ------------------------- EXTENSION CODE END ------------------------- */

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetchData('features.json'),
        fetchData('competitors.json')
    ]).then(([features, competitors]) => {
        renderFeatures(features);
        renderFeatureHeatmap(competitors, features);
        renderFeatureNetwork(identifyFeatureCategories(competitors));
        renderFeatureBarChart(competitors, features);
        updateMarketStandardUI(competitors, features);
    }).catch(error => {
        console.error('Error initializing dashboard:', error);
    });
    
    setupCategoryFilters();
});
