# Competition Analysis Dashboard

A dashboard for tracking competitive landscape and market positioning.

## Setup Instructions

This dashboard is designed to work with the Live Server extension in Visual Studio Code. Follow these steps to get started:

1. Install the Live Server extension in VS Code if you haven't already:
   - Click on the Extensions icon in the sidebar (or press `Ctrl+Shift+X`)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

2. Open the project folder in VS Code

3. Right-click on `index.html` and select "Open with Live Server"
   - This will launch a local development server and open the dashboard in your default browser
   - The server will automatically reload the page when you make changes to any files

## Data Storage Options

The dashboard offers two ways to store your data:

### Option 1: Local File Downloads

By default, when you make changes to the data (like adding a new competitor or feature), the application will:

1. Generate a JSON file for download
2. Show a notification that the file has been downloaded
3. You'll need to save this file to the project directory to replace the existing JSON file

### Option 2: GitHub Integration

The dashboard can also store data directly in a GitHub repository:

1. Create a new GitHub repository to store your dashboard data
2. Click the "GitHub Config" button in the bottom-left corner of the dashboard
3. Enter your GitHub username, repository name, and branch (usually "main")
4. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token"
   - Give it a name like "Dashboard Data"
   - Select the "repo" scope
   - Click "Generate token"
   - Copy the token and paste it in the GitHub Config modal
5. Click "Save" to store your GitHub configuration

Once configured, all data will be saved directly to your GitHub repository instead of being downloaded as files. This allows you to:
- Access your dashboard data from anywhere
- Share the dashboard with others
- Keep a history of all changes
- No need to manually save files

## Data Files

The dashboard uses the following JSON files to store data:

- `competitors.json` - Information about competitors
- `features.json` - List of features
- `erps.json` - List of ERP integrations
- `leadmagnets.json` - List of lead magnets

## Features

- **Features Comparison**: Track and compare features across competitors
- **ERP Integrations**: Monitor which ERP systems competitors integrate with
- **Lead Magnets**: Track lead generation strategies
- **Pricing**: Compare pricing models
- **Competitor Profiles**: Detailed profiles of each competitor
- **GitHub Integration**: Store data directly in a GitHub repository

## Notes

- The dashboard is fully responsive and works on all devices
- No server-side processing is required when using Live Server
- GitHub integration requires a GitHub account and repository
