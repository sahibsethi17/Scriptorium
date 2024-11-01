import { verifyToken } from "@/utils/auth";

export default function handler(req, res) {
    const user = verifyToken(req.headers.authorization);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    return res.status(201).json({ message: `Welcome to the homepage, ${user.username}!` });
}