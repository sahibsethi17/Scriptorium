import { verifyAuth } from "@/utils/auth";

export default function handler(req, res) {
    const { userId } = verifyAuth(req);
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(201).json({ message: `Welcome to the homepage, ${user.username}!` });
}