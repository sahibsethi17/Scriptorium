import { prisma } from "../../../utils/db";
import { hashPassword, verifyAuth } from "../../../utils/auth";

export default async function handler(req, res) {
  const { id } = req.query;

  const { userId } = await verifyAuth(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized action" });
  }

  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
  });

  const role = user.role;

  if (parseInt(userId, 10) !== parseInt(id, 10) && role.toLowerCase() !== 'admin') {
    return res.status(401).json({ error: "Unauthorized action" });
  }

  try {
    switch (req.method) {
      case "GET": {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(id, 10) },
        });

        if (!user) {
          return res.status(404).json({ error: "User not found." });
        }

        // Exclude the password field from the response
        const { password, ...userWithoutPassword } = user;

        const serializedUser = JSON.stringify(userWithoutPassword, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );

        return res.status(200).json({ user: JSON.parse(serializedUser) });
      }

      case "PUT": {
        const { email, password, username, firstName, lastName, phoneNumber, avatar } = req.body;

        if (!email && !password && !username && !firstName && !lastName && !phoneNumber && !avatar) {
          return res.status(400).json({ error: "Please provide at least one field to update." });
        }

        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
          }
        }

        const updateData = {
          email,
          username,
          firstName,
          lastName,
          phoneNumber: phoneNumber ? BigInt(phoneNumber) : undefined,
          avatar: avatar || undefined,
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

        // Exclude the password field from the response
        const { password: _, ...updatedUserWithoutPassword } = updatedUser;

        const serializedUser = JSON.stringify(updatedUserWithoutPassword, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        );

        return res
          .status(200)
          .json({ message: "User updated successfully", user: JSON.parse(serializedUser) });
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
