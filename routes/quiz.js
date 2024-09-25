const express = require("express");
const { authMiddleware, checkAdminMiddleware } = require("../middleware/authorizationMiddleWare");
const { getQuiz, getQuizByUser, getQuizBySubject, getQuizAdmin, getQuizById, createQuiz, deleteQuiz, updateQuiz } = require("../controllers/quizController");
const router = express.Router();

router.get("/", getQuiz);
router.get("/getquizbyuser", authMiddleware, getQuizByUser);
router.get("/admin", authMiddleware, checkAdminMiddleware, getQuizAdmin);
router.get("/:slug", getQuizById);
router.get("/subject/:id", getQuizBySubject);
router.post("/", authMiddleware, createQuiz);
router.patch("/:_id", authMiddleware, updateQuiz);
router.delete("/", authMiddleware, deleteQuiz);

module.exports = router;