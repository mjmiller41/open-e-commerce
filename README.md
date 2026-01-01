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

## 🗄️ Database Management

We use [Supabase](https://supabase.com/) for our database. For local development, we use the Supabase CLI to run a complete local stack.

### Prerequisites

1.  **Docker**: Ensure Docker Desktop is installed and running.
2.  **Supabase CLI**: Installed via devDependencies (use `npx supabase <command>`) or globally (`npm install -g supabase`).

### Initial Setup

To set up your local database environment and sync it with the remote project:

1.  **Login to Supabase**:

    ```bash
    npx supabase login
    ```

    Follow the instructions to authenticate via your browser.

2.  **Initialize Configuration** (if not already done):

    ```bash
    npx supabase init
    ```

3.  **Link to Remote Project**:
    You need your Supabase Project Reference ID (found in Project Settings > General).

    ```bash
    npx supabase link --project-ref <your-project-id>
    ```

4.  **Pull Remote Schema**:
    Download the current schema from the remote database to your local `supabase/migrations` directory.

    ```bash
    npx supabase db pull
    ```

5.  **Start Local Server**:
    Start the local Docker containers.
    ```bash
    npx supabase start
    ```
    This will output your local API URL, Anon Key, and Studio URL (usually http://localhost:54323).

### Migration Workflow

We use a declarative migration workflow to manage schema changes.

1.  **Make Changes**: Modify your database structure locally using the [Supabase Studio](http://localhost:54323) or SQL.
2.  **Generate Migration**: Create a SQL migration file from your changes.
    ```bash
    npx supabase db diff -f name_of_new_feature
    ```
3.  **Apply to Remote**: Push your new migrations to the remote Supabase project.

    ```bash
    npx supabase db push
    ```

4.  **Sync from Remote**: If changes are made via Supabase Dashboard, pull them down:
    ```bash
    npx supabase db pull
    ```

### Resetting Local Database

If you need to wipe your local database and start fresh from the migrations:

```bash
npx supabase db reset
```

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

## 🗺️ Roadmap

Here's what's planned for the future of Open E-Commerce:

- [x] **Backend Integration**: Connect to a robust backend (e.g., Supabase) for data persistence.
- [x] **User Authentication & Roles**: Secure login/signup and role management (Admin vs. Customer).
- [x] **Admin Dashboard**: A dedicated interface for
  - [x] managing products, inventory
  - [x] viewing orders
  - [x] managing users and their roles
- [x] **Order History**: User profile section to view past purchases.
- [x] **Advanced Search & Filtering**: Faceted search for better product discovery.
- [x] **Product Reviews**: Allow customers to rate and review products.
- [ ] **Payment Processing**: Integration with providers like Stripe or PayPal for real transactions.
- [ ] **Wishlist**: Save functionality for products.
