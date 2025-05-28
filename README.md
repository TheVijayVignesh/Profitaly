# ProfitAly - Financial Stock Market Platform

## Features

### Trial Room
- Global Stock Search with autocomplete
- Post-Purchase Holdings Display with sparklines
- Cash & Portfolio Value tracking

### Smart Advisor
- Investment Profile Management
- AI-powered stock recommendations
- Personalized investment strategies

### Fantasy Grounds
- Stock market competitions with virtual currency
- Real-time stock data from TwelveData/Finnhub
- Leaderboard and portfolio tracking
- Support for multiple market regions (NSE, NYSE, NASDAQ)

## Project info

**URL**: https://lovable.dev/projects/08eebed3-de38-4422-88c5-d33cb96975a1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/08eebed3-de38-4422-88c5-d33cb96975a1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Deployment Instructions

### Deploy to Firebase

1. Install Firebase CLI if you haven't already:
   ```sh
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```sh
   firebase login
   ```

3. Initialize Firebase in your project:
   ```sh
   firebase init
   ```
   - Select Hosting, Firestore, and Functions
   - Choose your Firebase project
   - Set the public directory to `dist`
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys: No

4. Build your project:
   ```sh
   npm run build
   ```

5. Deploy to Firebase:
   ```sh
   firebase deploy
   ```

### Deploy to Vercel

1. Install Vercel CLI if you haven't already:
   ```sh
   npm install -g vercel
   ```

2. Login to Vercel:
   ```sh
   vercel login
   ```

3. Deploy to Vercel:
   ```sh
   vercel
   ```
   - Follow the prompts to configure your project
   - Set the output directory to `dist`

4. For production deployment:
   ```sh
   vercel --prod
   ```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/08eebed3-de38-4422-88c5-d33cb96975a1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
