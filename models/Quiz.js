const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Liên kết tới User
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        default: "https://www.its.ac.id/tmesin/wp-content/uploads/sites/22/2022/07/no-image.png",
    },
    noa: {
        type: Number,
        default: 0, // Số lần làm bài
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: Boolean,
        default: false,
    },
    questions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataQuiz",
        required: true,
    },
    comment: [
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ID người dùng
            rating: { type: Number, required: true, min: 1, max: 5 }, // Điểm đánh giá (1-5)
            review: { type: String }, // Nhận xét
            created_at: { type: Date, default: Date.now }, // Ngày đánh giá
        },
    ],
});

const DataQuizSchema = new mongoose.Schema({
    data_quiz: {
        type: Array,
        required: true,
    },
});

module.exports = {
    QuizModel: mongoose.model("Quiz", QuizSchema),
    DataQuizModel: mongoose.model("DataQuiz", DataQuizSchema),
};
