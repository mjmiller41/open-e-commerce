# Open E-Commerce

A modern, open-source e-commerce starter template built with React, TypeScript, and Vite.

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (usually comes with Node.js)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/mjmiller41/open-e-commerce.git
    cd open-e-commerce
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 🛠️ Configuration

This project uses a central configuration file to manage global settings.

### Editing Global Config

You can modify site-wide settings in `site.config.jsonc` located in the root directory. This file supports comments.

**Available settings include:**

- `siteTitle`: The name of the site (displayed in header and browser tab).
- `siteDescription`: SEO description.
- `siteUrl`: Base URL for SEO/OG tags.
- `themeColor`: Primary browser theme color.
- `footer`: Footer text.

Changes to this file require restarting the dev server (`npm run dev`) to take effect.

The TypeScript interface for the configuration is located at `src/lib/config.ts`.

## 📦 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Type-checks and builds the app for production to the `dist` folder.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run deploy`: Deploys the project to GitHub Pages.

## 🚀 Deployment

### GitHub Pages

This project is configured to deploy directly to GitHub Pages using the `gh-pages` package.

1.  **Configure Base Path (if needed):**
    If you are deploying to a user page (e.g., `username.github.io`), you may need to adjust the `base` property in `vite.config.ts`.
    Currently configured base: `/open-e-commerce/` (repo name).

2.  **Deploy:**
    Run the deployment script:

    ```bash
    npm run deploy
    ```

    This script will:

    - Run `npm run build` to create a production bundle.
    - Push the `dist` folder to the `gh-pages` branch of your repository.

3.  **GitHub Settings:**
    Go to your repository settings on GitHub -> Pages -> Build and deployment > Source, and ensure it is set to deploy from the `gh-pages` branch.

## 📁 Project Structure

- `src/`: Source code
  - `components/`: React components
  - `pages/`: Page components and routing
  - `lib/`: Utility functions and configuration
  - `context/`: React Context providers
- `public/`: Static assets
- `site.config.jsonc`: Global configuration file
