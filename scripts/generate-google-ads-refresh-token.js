// scripts/generate-google-ads-refresh-token.js
/**
 * Script to generate Google Ads API Refresh Token
 *
 * Prerequisites:
 * 1. npm install google-auth-library readline
 * 2. Set up OAuth 2.0 credentials in Google Cloud Console
 *
 * Usage:
 * node scripts/generate-google-ads-refresh-token.js
 */

const { OAuth2Client } = require("google-auth-library");
const readline = require("readline");

// Configuration - Replace with your credentials
const CLIENT_ID =
  process.env.GOOGLE_ADS_CLIENT_ID ||
  "YOUR_CLIENT_ID.apps.googleusercontent.com";
const CLIENT_SECRET =
  process.env.GOOGLE_ADS_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

// Google Ads API scope
const SCOPES = ["https://www.googleapis.com/auth/adwords"];

async function generateRefreshToken() {
  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  // Generate authorization URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force to show consent screen to get refresh token
  });

                const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "📝 Step 2: Enter the authorization code from the redirect URL: ",
    async (code) => {
      rl.close();

      try {
                const { tokens } = await oauth2Client.getToken(code);

                        :");
                        :");
                                                                      } catch (error) {
              }
    }
  );
}

// Check if credentials are set
if (
  CLIENT_ID === "YOUR_CLIENT_ID.apps.googleusercontent.com" ||
  CLIENT_SECRET === "YOUR_CLIENT_SECRET"
) {
      process.exit(1);
}

generateRefreshToken();