// [id].js
import { prisma } from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    switch (req.method) {
      case "GET": {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id, 10) },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            avatar: true, // Include avatar path
            createdAt: true,
          },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user });
      }

      case "PUT": {
        const { email, password, username, firstName, lastName, phoneNumber, avatarPath } = req.body;

        if (!email && !password && !username && !firstName && !lastName && !phoneNumber && !avatarPath) {
          return res.status(400).json({ error: "Please provide at least one field to update." });
        }

        const updateData = {
          email,
          username,
          firstName,
          lastName,
          phoneNumber,
          avatar: avatarPath || undefined, // Update avatar path if provided
        };

        if (password) {
          if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long." });
          }
          updateData.password = await hashPassword(password);
        }

        const updatedUser = await prisma.user.update({
          where: { id: parseInt(id, 10) },
          data: updateData,
        });

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
      }

      case "DELETE": {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id, 10) },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        await prisma.user.delete({
          where: { id: parseInt(id, 10) },
        });

        return res.status(200).json({ message: "User deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "An error occurred. Please try again later." });
  }
}
