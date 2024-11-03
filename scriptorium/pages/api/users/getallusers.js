import { prisma } from "@/utils/db"; 

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const users = await prisma.user.findMany();

            const usersSafe = users.map(user => ({
                ...user,
                phoneNumber: user.phoneNumber.toString(), 
            }));

            return res.status(200).json({ users: usersSafe });
        } catch (error) {
            return res.status(500).json({ error: "Failed to fetch users." });
        }
    } else {
        return res.status(405).json({ error: "Method not allowed." });
    }
}
