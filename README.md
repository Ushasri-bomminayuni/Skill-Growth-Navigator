# Skill Growth Navigator

A comprehensive web platform that centralizes internships, scholarships, hackathons, competitions, fellowships, and learning opportunities with AI-powered personalized recommendations for students.

## Features

- **AI-Powered Recommendations**: Personalized opportunity suggestions based on user profile
- **Opportunity Discovery**: Search and filter opportunities by category, skills, location, and more
- **Application Tracker**: Track application status and deadlines
- **Bookmark System**: Save opportunities for later
- **Notification System**: Real-time alerts for new opportunities and deadlines
- **Admin Dashboard**: Manage opportunities, users, and analytics
- **Scraping Pipeline**: Automated opportunity scraping from various sources
- **Responsive Design**: Mobile-first, futuristic UI with animations

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- 21st.dev UI Components
- ShadCN UI
- Framer Motion (animations)
- Lucide Icons

### Backend
- Next.js API Routes
- Firebase Cloud Functions

### Database
- Firebase Firestore

### Authentication
- Firebase Authentication (Google OAuth, Email/Password)

### Storage
- Firebase Storage

### Notifications
- Firebase Cloud Messaging

### AI
- OpenAI API (for embeddings and recommendations)

### Scraping
- Python (BeautifulSoup, Playwright)

### Deployment
- Vercel (Frontend)
- Firebase (Backend services)

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Python (v3.8 or later)
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/skill-growth-navigator.git
cd skill-growth-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add the following variables:
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

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

4. Set up Firebase:
- Create a Firebase project at https://console.firebase.google.com/
- Enable Authentication (Google and Email/Password providers)
- Enable Firestore Database
- Enable Storage
- Enable Cloud Messaging

5. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

6. Login to Firebase:
```bash
firebase login
```

7. Initialize Firebase:
```bash
firebase init
```

8. Install Python dependencies for scraping:
```bash
cd scripts
pip install -r requirements.txt
playwright install
```

### Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

### Running Scrapers

To run the scraping pipeline:
```bash
cd scripts
python scraper_scheduler.py
```

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Go to https://vercel.com/ and import your project
3. Configure environment variables in Vercel settings
4. Deploy

### Firebase Deployment

1. Build your Next.js application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

### Setting up Firebase Cloud Functions

1. Navigate to the functions directory:
```bash
cd functions
npm install
```

2. Deploy functions:
```bash
firebase deploy --only functions
```

## Project Structure

```
skill-growth-navigator/
├── .github/                  # GitHub workflows
├── public/                   # Static assets
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (dashboard)/        # Dashboard routes
│   │   ├── (admin)/            # Admin routes
│   │   ├── api/                # API routes
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/                # ShadCN & 21st.dev components
│   │   ├── cards/              # Opportunity cards
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── forms/              # Forms and inputs
│   │   └── animations/        # Framer Motion animations
│   ├── config/                # Configuration files
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   │   ├── ai/                # AI recommendation engine
│   │   ├── scraping/          # Scraping utilities
│   │   └── utils.ts           # General utilities
│   ├── styles/                # Global styles
│   ├── types/                 # TypeScript types
│   └── services/              # Service layers
├── scripts/                  # Python scraping scripts
├── .env.local                # Environment variables
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License.