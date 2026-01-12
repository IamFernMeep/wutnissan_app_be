export function authMiddleware(req, res, next) {
    if (process.env.NODE_ENV === "development") {
        // mock user
        req.user = { id: 999, username: "devuser", role: "admin" };
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized: No token provided",
            data: []
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            code: 401,
            message: "Unauthorized: Invalid token",
            data: []
        });
    }
}
