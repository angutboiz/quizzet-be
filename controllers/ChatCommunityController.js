const { Message, ChatCommunity } = require("../models/ChatCommunity");
const getMessages = async (req, res) => {
    const { skip = 0, limit = 50 } = req.query;

    try {
        // Lấy phòng chat
        const chatCommunity = await ChatCommunity.findOne({ room: "community" });

        if (!chatCommunity) {
            return res.status(404).json({ message: "No messages found" });
        }

        // Lấy tin nhắn theo giới hạn và skip
        const totalMessages = await Message.countDocuments({ _id: { $in: chatCommunity.messages } }); // Tổng số tin nhắn
        const messages = await Message.find({ _id: { $in: chatCommunity.messages } })
            .skip(Number(skip))
            .limit(Number(limit))
            .populate([
                { path: "userId", select: "displayName profilePicture" }, // Populating User
                {
                    path: "replyTo",
                    select: "message userId unsend image",
                    populate: { path: "userId", select: "_id displayName profilePicture" }, // Nested population for replyTo.userId
                },
                { path: "reactions.userId", select: "displayName profilePicture" }, // Populating reactions
            ]);

        res.status(200).json({
            messages,
            hasMore: skip + limit < totalMessages,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addMessage = async (req, res) => {
    const { userId, message, image, replyTo } = req.body;

    try {
        // Tạo tin nhắn mới
        const newMessage = new Message({
            userId,
            message,
            image,
            replyTo, // Có thể null nếu không phải reply
        });

        // Lưu tin nhắn
        const savedMessage = await newMessage.save();

        // Gắn tin nhắn vào phòng chat
        await ChatCommunity.findOneAndUpdate({ room: "community" }, { $push: { messages: savedMessage._id } }, { new: true, upsert: true });

        // Lấy lại tin nhắn vừa lưu và populate
        // const populatedMessage = await Message.findById(savedMessage._id).populate("userId", "_id displayName profilePicture").populate("replyTo");

        const populatedMessage = await Message.findById(savedMessage._id).populate([
            { path: "userId", select: "displayName profilePicture" }, // Populating User
            {
                path: "replyTo",
                select: "message userId unsend image",
                populate: { path: "userId", select: "_id displayName profilePicture" }, // Nested population for replyTo.userId
            },
        ]);

        res.status(201).send(populatedMessage);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const addReaction = async (req, res) => {
    const { messageId, userId, emoji } = req.body;

    try {
        // Tìm tin nhắn dựa trên `messageId`
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ ok: false, message: "Tin nhắn không tồn tại" });
        }

        // Kiểm tra xem userId đã react chưa
        const existingReactionIndex = message.reactions.findIndex((reaction) => reaction.userId.toString() === userId.toString());

        if (existingReactionIndex !== -1) {
            // Nếu đã react
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Nếu emoji giống nhau, xóa reaction
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Nếu emoji khác nhau, cập nhật emoji
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // Nếu chưa react, thêm reaction mới
            message.reactions.push({ userId, emoji });
        }

        // Lưu cập nhật vào DB
        await message.save();
        const updatedMessage = await Message.findById(messageId).populate("reactions.userId", "_id displayName profilePicture");

        res.status(200).json({ ok: true, reactions: updatedMessage.reactions });
    } catch (error) {
        console.error("Error in addReaction:", error);
        res.status(500).json({ ok: false, message: "Lỗi server" });
    }
};

const unsendMessage = async (req, res) => {
    const { messageId, userId } = req.body;

    try {
        const message = await Message.findOneAndUpdate({ _id: messageId, userId: userId }, { $set: { unsend: true } }, { new: true });

        if (!message) {
            return res.status(404).json({ ok: false, message: "Tin nhắn không tồn tại hoặc bạn không có quyền xóa" });
        }

        res.status(200).json({ ok: true, message: "Gỡ tin nhắn thành công" });
    } catch (error) {
        console.log(error);

        res.status(500).send(error.message);
    }
};

const editMessage = async (req, res) => {
    const { messageId, userId, newMessage } = req.body;

    try {
        const result = await Message.findOneAndUpdate({ _id: messageId, userId: userId }, { $set: { message: newMessage, isEdit: true } }, { new: true });

        if (!result) {
            return res.status(404).json({ ok: false, message: "Tin nhắn không tồn tại hoặc bạn không có quyền xóa" });
        }

        res.status(200).json({ ok: true, message: "Gỡ tin nhắn thành công" });
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

module.exports = {
    getMessages,
    addReaction,
    addMessage,
    unsendMessage,
    editMessage,
};
