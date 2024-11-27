import { verifyAuth } from "@/utils/auth";
import { prisma } from "../../utils/db";

export default async function handler(req, res) {
  try {
    const authResult = await verifyAuth(req);

    if (!authResult || !authResult.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(authResult.userId, 10) },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ role: user.role });
  } catch (error) {
    console.error("Error in user-role handler:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}