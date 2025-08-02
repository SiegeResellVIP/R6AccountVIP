
# Siege Sellify Setup Instructions

## Database Setup (Required for Authentication)

To enable user authentication (sign up/sign in), you need to set up MongoDB:

### Option 1: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. In your Repl, go to the Secrets tool (🔒)
6. Add a secret named `MONGODB_URI` with your connection string

### Option 2: Local MongoDB (Development)
1. The app will try to connect to `mongodb://localhost:27017/siege-sellify`
2. This won't work in Replit environment

### Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Repl URL to authorized redirect URIs
6. Add secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Session Secret
Add a secret named `SESSION_SECRET` with a random string for security.

## Current Status
- ✅ Website works without authentication
- ❌ Sign up/Sign in requires MongoDB setup
- ❌ Google OAuth requires Google Cloud setup
