# Deployment Guide

This guide provides step-by-step instructions for deploying Skill Growth Navigator to production.

## Prerequisites

- Firebase account (https://console.firebase.google.com/)
- Vercel account (https://vercel.com/)
- OpenAI API key
- GitHub repository

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup steps
3. Note your Project ID (you'll need it for configuration)

### 2. Enable Firebase Services

#### Authentication
1. Go to Authentication section
2. Click "Get started"
3. Enable Google and Email/Password providers
4. For Google provider, add your domain to authorized domains

#### Firestore Database
1. Go to Firestore Database section
2. Click "Create database"
3. Start in test mode (you'll update security rules later)
4. Choose a location for your database

#### Storage
1. Go to Storage section
2. Click "Get started"
3. Start in test mode (you'll update security rules later)

#### Cloud Messaging
1. Go to Cloud Messaging section
2. Note your Server Key and Sender ID
3. Generate a Web Push certificate (VAPID key)

### 3. Set Up Firebase Security Rules

Update your `firestore.rules` and `storage.rules` files with the provided security rules, then deploy them:

```bash
firebase deploy --only firestore:rules,storage:rules
```

### 4. Get Firebase Configuration

1. Go to Project settings
2. Under "Your apps", click "Web app" (</> icon)
3. Register your app and copy the Firebase configuration
4. Add these values to your `.env.local` file

## Vercel Setup

### 1. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the root directory (`skill-growth-navigator`)

### 2. Configure Environment Variables

In Vercel project settings, add all environment variables from your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key

OPENAI_API_KEY=your_openai_api_key

NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

### 3. Configure Build Settings

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

### 4. Deploy

Click "Deploy" to build and deploy your application.

## Firebase Cloud Functions

### 1. Set Up Firebase Functions

1. Navigate to the functions directory:
```bash
cd functions
```

2. Install dependencies:
```bash
npm install
```

3. Deploy functions:
```bash
firebase deploy --only functions
```

### 2. Set Up Scheduled Functions

For scheduled scraping and notifications:

1. Go to Firebase Console → Cloud Functions
2. Set up a scheduler to run your scraping functions every 6 hours
3. Set up a scheduler to run notification functions daily

## Scraping Pipeline Setup

### 1. Set Up Python Environment

```bash
cd scripts
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install
```

### 2. Configure Scraping

1. Update the Firebase service account path in each scraper
2. Add your LinkedIn credentials to `.env` (if needed)
3. Test each scraper individually:
```bash
python scrape_linkedin.py
python scrape_devpost.py
python scrape_scholarships.py
```

### 3. Set Up Scraper Scheduler

1. Configure the `scraper_scheduler.py` to run on your server
2. Set up a cron job or scheduled task to run the scheduler:
```bash
# Example cron job (runs every 6 hours)
0 */6 * * * cd /path/to/skill-growth-navigator/scripts && python scraper_scheduler.py
```

## Domain Setup

### 1. Configure Custom Domain in Vercel

1. Go to your Vercel project settings
2. Click "Domains" → "Add"
3. Enter your custom domain (e.g., `skillgrowthnavigator.com`)
4. Follow the DNS configuration instructions

### 2. Set Up Firebase Hosting (Optional)

If you want to use Firebase Hosting instead of Vercel:

1. Initialize Firebase Hosting:
```bash
firebase init hosting
```

2. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

3. Deploy to Firebase Hosting:
```bash
npm run build
firebase deploy --only hosting
```

## Monitoring and Analytics

### 1. Set Up Firebase Analytics

1. Go to Firebase Console → Analytics
2. Set up conversion events for key actions (signups, applications, etc.)

### 2. Set Up Vercel Analytics

1. Go to Vercel project settings
2. Enable Analytics
3. Monitor performance and errors

### 3. Set Up Error Tracking

Consider setting up Sentry or similar error tracking:

1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Configure Sentry in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // your existing config
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
});
```

## CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

## Post-Deployment Tasks

### 1. Set Up Admin User

1. Register a user through the application
2. Go to Firebase Console → Firestore
3. Find the user document and set `isAdmin: true`

### 2. Seed Initial Data

1. Run the scraping pipeline to populate opportunities
2. Manually add some test opportunities through the admin dashboard

### 3. Configure Notifications

1. Set up Firebase Cloud Messaging for push notifications
2. Configure email notifications (if using a service like SendGrid)

### 4. Set Up Monitoring

1. Configure alerts for errors and performance issues
2. Set up uptime monitoring
3. Configure logging

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Ensure you've enabled the correct authentication providers
   - Verify your domain is added to authorized domains
   - Check that your Firebase configuration is correct

2. **Firestore Permission Denied**
   - Verify your security rules are deployed
   - Check that the user is authenticated
   - Ensure the rules match your application logic

3. **Scraping Failures**
   - Check if the target website has changed its structure
   - Verify your IP isn't blocked
   - Check for CAPTCHAs or other anti-bot measures

4. **Performance Issues**
   - Check Lighthouse scores and optimize as needed
   - Verify database indexes are set up correctly
   - Consider implementing caching for frequent queries

5. **Deployment Failures**
   - Check Vercel build logs for errors
   - Verify all environment variables are set
   - Ensure your dependencies are compatible

### Support

For issues or questions, please:
1. Check the GitHub issues for similar problems
2. Create a new issue if your problem isn't listed
3. Contact the maintainers for critical issues