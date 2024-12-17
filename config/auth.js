const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
// Configure Passport with Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID, // Thay bằng Client ID từ Google
            clientSecret: process.env.CLIENT_SECRET, // Thay bằng Client Secret từ Google
            callbackURL: "https://quizzet-be.vercel.app/api/auth/google/callback",
            passReqToCallback: true, // Thêm dòng này
            scope: ["profile", "email", "openid"], // Đầy đủ scope
        },

        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // Tìm user theo Google ID trước
                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    // Nếu đã tồn tại Google ID, trả về user
                    return done(null, user);
                } else {
                    // Tìm user theo email
                    const existingUserByEmail = await User.findOne({
                        email: profile.emails[0].value,
                    });

                    if (existingUserByEmail) {
                        // Nếu tìm thấy user có email, merge thông tin
                        existingUserByEmail.googleId = profile.id;

                        // Cập nhật thêm các thông tin từ Google profile nếu cần
                        existingUserByEmail.displayName = existingUserByEmail.name || profile.displayName;

                        // Lưu lại user đã merge
                        await existingUserByEmail.save();

                        return done(null, existingUserByEmail);
                    }

                    // Nếu không tìm thấy user nào, tạo mới
                    const newUser = new User({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        profilePicture: profile.photos[0].value,
                        provider: profile.provider,
                        verify: profile.emails[0].verified,
                    });
                    await newUser.save();
                    return done(null, newUser);
                }
            } catch (error) {
                console.error("Google Auth Error:", error);
                return done(error);
            }
        }
    )
);

// Phương thức serialize user
passport.serializeUser((user, done) => {
    // Lưu user ID vào session
    done(null, user.id);
});

// Phương thức deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        // Tìm user từ ID trong database
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});