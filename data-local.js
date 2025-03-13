// Data handling functions using localStorage instead of server-side saving

// Fetch data from localStorage or use default data
async function fetchData(filename) {
    try {
        // Try to get data from localStorage
        const localData = localStorage.getItem(filename);
        
        if (localData) {
            return JSON.parse(localData);
        } else {
            // If no data in localStorage, return default data
            console.log(`Creating new ${filename} data in localStorage`);
            const defaultData = getDefaultData(filename);
            
            // Save default data to localStorage
            localStorage.setItem(filename, JSON.stringify(defaultData));
            
            return defaultData;
        }
    } catch (error) {
        console.warn(`Error fetching ${filename} from localStorage:`, error);
        // Return default empty data if fetch fails
        return getDefaultData(filename);
    }
}

// Get default empty data structure based on file type
function getDefaultData(filename) {
    switch (filename) {
        case 'competitors.json':
            return [];
        case 'features.json':
            return extractFeaturesFromDoc();
        case 'erps.json':
            return extractERPsFromDoc();
        case 'leadmagnets.json':
            return ["ROI Calculator", "Whitepaper", "Case Study", "Webinar", "Free Trial"];
        case 'pricing.json':
            return [];
        default:
            return [];
    }
}

// Save data to localStorage
async function saveData(filename, data) {
    try {
        // Save data to localStorage
        localStorage.setItem(filename, JSON.stringify(data));
        return { success: true };
    } catch (error) {
        console.error(`Error saving ${filename} to localStorage:`, error);
        throw error;
    }
}

// Save competitor to localStorage
async function saveCompetitorToDatabase(competitor) {
    // First fetch all competitors
    const competitors = await fetchData('competitors.json');
    
    // Check if competitor already exists
    const existingIndex = competitors.findIndex(comp => comp.id === competitor.id);
    
    if (existingIndex >= 0) {
        // Update existing competitor
        competitors[existingIndex] = competitor;
    } else {
        // Add new competitor
        competitors.push(competitor);
    }
    
    // Save updated competitors list
    await saveData('competitors.json', competitors);
    
    // Update features, ERPs, and lead magnets lists
    await updateTagList('features.json', competitor.features);
    await updateTagList('erps.json', competitor.erps);
    await updateTagList('leadmagnets.json', competitor.leadMagnets);
    
    return { success: true };
}

// Update a tag list with new items
async function updateTagList(filename, newTags) {
    const existingTags = await fetchData(filename);
    
    // Add any new tags that don't already exist
    let updated = false;
    newTags.forEach(tag => {
        if (!existingTags.includes(tag)) {
            existingTags.push(tag);
            updated = true;
        }
    });
    
    // Only save if there were changes
    if (updated) {
        await saveData(filename, existingTags);
    }
    
    return { success: true };
}

// Extract features from competition analysis document
function extractFeaturesFromDoc() {
    // This would normally parse the document, but for now we'll hard-code the features
    return [
        "Automated follow-up",
        "Dialogue through invoice portal",
        "Various payment methods",
        "Smart payment plan",
        "Electronic invoicing",
        "Notes and task lists",
        "Automated reminders",
        "Online payment processing",
        "Customer portal for easy access",
        "Dispute management tools",
        "Integrated mailbox",
        "Real-time financial dashboard and reporting",
        "Email/SMS chase automation",
        "Credit risk dashboard",
        "Custom reminders",
        "Debt recovery support",
        "Unlimited booking of purchase and sales invoices",
        "Easy creation and sending of (e-)invoices",
        "Creation and sending of recurring invoices",
        "Scanned receipts directly in the accounting system",
        "VAT declaration automatically prepared for submission",
        "24/7 availability with secure access to key business figures",
        "Expandable with modules for quotes, orders, webshops, and logistics",
        "Seamless collaboration with an accountant in one online environment",
        "Smart automation reduces errors and increases efficiency",
        "Unlimited online invoicing and quotations",
        "Automatic VAT declaration calculation and submission",
        "Scan and recognize receipts via app",
        "Payment reminders and dunning management",
        "Integration with various banks for automated transaction processing",
        "Subscription billing and installment invoicing",
        "Inventory management and order processing",
        "Multi-currency invoicing and international tax compliance",
        "Financial reports and analysis tools",
        "Online bookkeeping tailored for freelancers and small businesses",
        "Easy invoice creation with customizable branding",
        "Bank transaction import and reconciliation",
        "Mobile app for receipt scanning and financial management",
        "Digital storage of invoices and receipts",
        "Time tracking and mileage registration for invoicing",
        "Secure collaboration with accountants",
        "Integration with online payment solutions",
        "Facturen en offertes",
        "Online betaalmethoden",
        "Automatische btw-aangifte",
        "Banktransacties koppelen",
        "Zakelijke betaalrekening",
        "Abonnementenbeheer",
        "Productbeheer",
        "Urenregistratie",
        "Workflow automatisering",
        "Peppol facturen verzenden",
        "Toegang voor boekhouders",
        "Financiële rapportages",
        "Automated debt recovery",
        "Payment monitoring",
        "Late fee calculations",
        "Legal proceedings assistance",
        "Automated bookkeeping and invoicing",
        "Real-time financial insights and reporting",
        "Seamless bank integrations for transaction processing",
        "Multi-user access with role-based permissions",
        "AI-powered receipt and document recognition",
        "Tax compliance tools including VAT and ICP declarations",
        "Integration with e-commerce platforms and payment providers",
        "Customizable dashboards and analytics",
        "Customer risk assessment and credit scoring",
        "Multi-channel communication for invoice follow-ups",
        "Secure client portal for payments and document access",
        "AI-driven cash flow prediction and insights",
        "Credit management automation",
        "Risk assessment and mitigation",
        "Dispute resolution tracking",
        "Credit insurance management",
        "AI-powered reconciliation",
        "Fraud prevention and vendor verification",
        "Subscription billing support",
        "Payment processing integration"
    ];
}

// Extract ERPs from competition analysis document
function extractERPsFromDoc() {
    // This would normally parse the document, but for now we'll hard-code the ERPs
    return [
        "Oracle NetSuite",
        "QuickBooks",
        "Wolters Kluwer",
        "Visma.net",
        "Xero",
        "SAP",
        "AccountView",
        "AFAS",
        "Exact Online",
        "King Software",
        "Microsoft Dynamics 365 BC",
        "Moneybird",
        "SnelStart",
        "Twinfield",
        "Visma Cash",
        "Yuki",
        "Microsoft Dynamics 365",
        "AccountsIQ",
        "Sage intacct",
        "Sage Accounting",
        "Sage 50 UK",
        "Sage 200",
        "Chaser API",
        "CSV",
        "Visma eAccounting",
        "Visma.net Financials",
        "Davilex",
        "Brincr",
        "SnelStart inStap",
        "SnelStart inKaart",
        "SnelStart inBalans",
        "SnelStart inZicht",
        "SnelStart inControle",
        "Peppol",
        "Ponto",
        "Zapier API",
        "PayPal",
        "Mollie",
        "Sage 100",
        "Sage FRP 1000",
        "Sage X3",
        "Cegid XRP FLEX",
        "Quadra Enterprise",
        "Pennylane",
        "Divalto",
        "Sellsy",
        "Odoo",
        "EBP",
        "Chargebee",
        "Excel",
        "OpenSi",
        "Silog",
        "ACD",
        "IBM",
        "Oracle",
        "Infor",
        "Axelor",
        "Wavesoft",
        "Axonaut",
        "Indy",
        "I Paid That",
        "Sinao",
        "Itool",
        "Zephyr",
        "Cogilog",
        "Evaliz",
        "Exact",
        "Je Pilote Mon Entreprise",
        "Mister Compta",
        "Wity",
        "Bestand of API",
        "QuickBooks Online",
        "QuickBooks Pro/Premier",
        "QuickBooks Enterprise",
        "Sage Intacct",
        "Chargebee",
        "Zuora"
    ];
}

// Initialize data files with data from Competition Analysis document
async function initializeDataFromDoc() {
    // Extract competitors from document
    const competitors = extractCompetitorsFromDoc();
    
    // Save competitors data
    await saveData('competitors.json', competitors);
    
    // Extract and save features
    const features = extractFeaturesFromDoc();
    await saveData('features.json', features);
    
    // Extract and save ERPs
    const erps = extractERPsFromDoc();
    await saveData('erps.json', erps);
    
    // Create lead magnets list
    const leadMagnets = ["ROI Calculator", "Whitepaper", "Case Study", "Webinar", "Free Trial"];
    await saveData('leadmagnets.json', leadMagnets);
    
    console.log('Initialized data files successfully in localStorage');
    return { success: true };
}

// Extract competitors from document
function extractCompetitorsFromDoc() {
    // This would normally parse the document, but for now we'll provide some sample data
    return [
        {
            id: 'payt001',
            name: 'Payt',
            country: 'NL',
            website: 'https://payt.nl',
            subscriptionModels: [
                {
                    name: 'Basic',
                    currentPrice: 49,
                    currentPriceDate: '2025-03-06'
                }
            ],
            features: [
                'Automated follow-up',
                'Dialogue through invoice portal',
                'Various payment methods',
                'Smart payment plan',
                'Electronic invoicing',
                'Notes and task lists'
            ],
            erps: [
                'Oracle NetSuite',
                'QuickBooks',
                'Wolters Kluwer',
                'Visma.net',
                'Xero',
                'SAP'
            ],
            leadMagnets: ['ROI Calculator', 'Free Trial']
        },
        {
            id: 'notify001',
            name: 'Notify',
            country: 'NL',
            website: 'https://notify.eu',
            subscriptionModels: [
                {
                    name: 'Starter',
                    currentPrice: 39,
                    currentPriceDate: '2025-03-06'
                },
                {
                    name: 'Professional',
                    currentPrice: 99,
                    currentPriceDate: '2025-03-06',
                    oldPrice: 89,
                    oldPriceDate: '2024-10-01'
                }
            ],
            features: [
                'Automated reminders',
                'Online payment processing',
                'Customer portal for easy access',
                'Dispute management tools',
                'Integrated mailbox',
                'Various payment methods',
                'Real-time financial dashboard and reporting'
            ],
            erps: [
                'AccountView',
                'AFAS',
                'Exact Online',
                'King Software',
                'Microsoft Dynamics 365 BC',
                'Moneybird',
                'SnelStart',
                'Twinfield',
                'Visma Cash',
                'Yuki'
            ],
            leadMagnets: ['Case Study', 'Webinar']
        },
        {
            id: 'chaser001',
            name: 'Chaser',
            country: 'UK',
            website: 'https://chaser.io',
            subscriptionModels: [
                {
                    name: 'Small Business',
                    currentPrice: 99,
                    currentPriceDate: '2025-03-06'
                },
                {
                    name: 'Enterprise',
                    currentPrice: 299,
                    currentPriceDate: '2025-03-06'
                }
            ],
            features: [
                'Email/SMS chase automation',
                'Credit risk dashboard',
                'Custom reminders',
                'Debt recovery support'
            ],
            erps: [
                'Microsoft Dynamics 365',
                'AccountsIQ',
                'Xero',
                'QuickBooks',
                'Sage intacct',
                'Sage Accounting',
                'Sage 50 UK',
                'Sage 200',
                'Chaser API',
                'SAP'
            ],
            leadMagnets: ['ROI Calculator', 'Whitepaper', 'Free Trial']
        }
    ];
}

// Check if we need to initialize data
(async function() {
    try {
        const competitors = await fetchData('competitors.json');
        
        // If there are no competitors, initialize the data
        if (competitors.length === 0) {
            await initializeDataFromDoc();
        }
    } catch (error) {
        console.error('Error checking for data initialization:', error);
    }
})();
