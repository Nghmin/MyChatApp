export const validateRegister = (req, res, next) => {
    const { username, email, phone, password, confirmPassword } = req.body;

    // 1. Kiểm tra không được để trống
    if (!username || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ tất cả thông tin!" });
    }

    // 2. Kiểm tra định dạng Email đơn giản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không đúng định dạng!" });
    }

    // 3. Kiểm tra số điện thoại (Việt Nam - 10 số)
    const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ (phải đủ 10 số)!" });
    }

    // 4. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
        return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
        return res.status(400).json({ message: "Mật khẩu phải bao gồm cả chữ và số!" });
    }

    // 5. So khớp mật khẩu và xác nhận mật khẩu
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Mật khẩu xác nhận không khớp!" });
    }

    next(); 
};

export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    // 1. Kiểm tra xem có để trống không
    if (!email || !password) {
        return res.status(400).json({ message: "Email và mật khẩu không được để trống!" });
    }

    // 2. Kiểm tra định dạng email cơ bản (để tránh gửi rác lên DB)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    next();
};