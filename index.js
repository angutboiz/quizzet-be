const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const quizRoutes = require("./routes/quiz");
const HistoryRoutes = require("./routes/history");
const AdminRoutes = require("./routes/admin");
const ToolRoutes = require("./routes/tool");
const ChatRoutes = require("./routes/chat");
const uploadRoutes = require("./routes/uploadRouter");
const ChatCommuRoutes = require("./routes/ChatCommunity");
const connectDB = require("./config/db");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");

connectDB();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Cấu hình session
app.use(
    session({
        secret: process.env.SECRET_KEY, // Sử dụng một secret mạnh
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production", // Chỉ sử dụng secure cookie ở production
            maxAge: 24 * 60 * 60 * 1000, // 24 giờ
        },
    })
);

// Middleware Passport
app.use(passport.initialize());
app.use(passport.session());

require("./config/auth"); // Import cấu hình Passport
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"], failureRedirect: "/login/failure" }));

app.get(
    "/api/auth/google/callback",
    (req, res, next) => {
        console.log("Callback Query:", req.query);
        next();
    },
    passport.authenticate("google", {
        failureRedirect: "/login/failure",
        session: false,
    }),
    (req, res) => {
        // Tạo token như bình thường
        const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

        res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    }
);

// Thêm route xử lý khi login thất bại
app.use("/login/failure", (req, res) => {
    res.status(401).json({
        message: "Google Authentication Failed",
        error: "Unable to authenticate with Google",
    });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/history", HistoryRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/tool", ToolRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/chatcommu", ChatCommuRoutes);
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
