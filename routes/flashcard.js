const express = require("express");
const {
    createFlashCard,
    getAllFlashCards,
    getFlashCardById,
    updateFlashCard,
    deleteFlashCard,
    createListFlashCard,
    getAllListFlashCards,
    getListFlashCardById,
    updateListFlashCard,
    deleteListFlashCard,
    getFlashCardByUser,
} = require("../controllers/flashCardController");
const { authMiddleware, checkAdminMiddleware } = require("../middleware/authorizationMiddleWare");
const router = express.Router();

// Flashcard Routes
router.post("/flashcards", authMiddleware, createFlashCard); // Tạo flashcard mới
router.get("/flashcards", authMiddleware, getAllFlashCards); // Lấy tất cả flashcards public
router.get("/flashcards/user", authMiddleware, getFlashCardByUser); // Lấy tất cả flashcards public
router.get("/flashcards/:id", authMiddleware, getFlashCardById); // Lấy flashcard theo ID
router.put("/flashcards/:id", authMiddleware, updateFlashCard); // Cập nhật flashcard
router.delete("/flashcards/:id", authMiddleware, deleteFlashCard); // Xóa flashcard

// List Flashcard Routes
router.post("/list-flashcards", authMiddleware, createListFlashCard); // Tạo danh sách flashcards mới
router.get("/list-flashcards", authMiddleware, getAllListFlashCards); // Lấy tất cả danh sách flashcards của user
router.get("/list-flashcards/:id", authMiddleware, getListFlashCardById); // Lấy danh sách flashcards theo ID
router.put("/list-flashcards/:id", authMiddleware, updateListFlashCard); // Cập nhật danh sách flashcards
router.delete("/list-flashcards/:id", authMiddleware, deleteListFlashCard); // Xóa danh sách flashcards

module.exports = router;
