import { prisma } from "@/utils/db";
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id, 10) },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        const serializedUser = JSON.stringify(user, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );

        return res.status(200).json({ user: serializedUser });
      }

      case 'PUT': {
        const { email, password, username, firstName, lastName, phoneNumber } = req.body;

        if (!email && !password && !username && !firstName && !lastName && !phoneNumber) {
          return res.status(400).json({ error: "Please provide at least one field to update." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format." });
        }

        const updateData = {
          email,
          username,
          firstName,
          lastName,
          phoneNumber,
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

        const serializedUser = JSON.stringify(updatedUser, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );

        return res.status(200).json({ message: "User updated successfully", user: serializedUser });
      }

      case 'DELETE': {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id, 10) },
        });
      
        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }
      
        // Proceed with deletion if the user exists
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
