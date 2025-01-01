const mongoose = require("mongoose");

const SOSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "https://www.its.ac.id/tmesin/wp-content/uploads/sites/22/2022/07/no-image.png",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    lenght: {
        type: Number,
        default: 0,
    },
    view: {
        type: Number,
        default: 1,
    },
    subject: {
        type: String,
        required: true,
        default: "none",
    },
    quest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DataSO",
        required: true,
    },
});

const DataSOSchema = new mongoose.Schema({
    data_so: {
        type: Array,
        required: true,
    },
});

module.exports = {
    SOModel: mongoose.model("SO", SOSchema),
    DataSOModel: mongoose.model("DataSO", DataSOSchema),
};
