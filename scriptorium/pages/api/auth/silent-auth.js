import { verifyAuth } from "../../../utils/auth";

export default async function handler(req, res) {
  try {
    // Call verifyAuth to validate or refresh the user's tokens
    const authResult = await verifyAuth(req);

    if (authResult.error) {
      // If there is an authentication error, return the appropriate response
      return res.status(authResult.status || 401).json({ message: authResult.error });
    }

    if (authResult.accessToken) {
      // If a new access token is issued, return it to the client
      return res.status(200).json({ newAccessToken: authResult.accessToken });
    }

    // If no new token is needed and the session is valid
    return res.status(200).json({ message: "Session is still valid." });
  } catch (error) {
    console.error("Error in /api/auth/silent-auth:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}