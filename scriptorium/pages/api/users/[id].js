import { prisma } from "@/utils/db"

export default async function handler(req, res) {
    let { id } = req.query;

    id = Number(id);

    if (!id) {
        return res.status(400).json({ error: "Missing ID." });
    }

    if (req.method === "GET") {
        const user = await prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found."});
        }

        return res.status(200).json(user);
    } else if (req.method === "POST") { // or put
        const { email, password, username, firstName, lastName } = req.body;

        const user = await prisma.user.update({
            where: {
                id,
            },
            data: {
                email,
                password,
                username,
                firstName,
                lastName
            },
        });

        return res.status(200).json(user);
    } else if (req.method === "DELETE") {
        await prisma.user.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({ message: "User deleted."});
    }
}