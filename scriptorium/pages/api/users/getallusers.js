import { prisma } from "@/utils/db";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Fetch all users and select specific fields, including the avatar path
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    avatar: true, // Include avatar path
                    role: true
                },
            });

            // Serialize phoneNumber as a string to handle BigInt safely
            const usersSafe = users.map(user => ({
                ...user,
                phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : null,
            }));

            return res.status(200).json({ users: usersSafe });
        } catch (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ error: "Failed to fetch users." });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed." });
    }
}