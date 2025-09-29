// middlewares/validatePasswordUpdate.js
export const validatePasswordUpdate = (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
  
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Lütfen eski şifre, yeni şifre ve şifre tekrar alanlarını doldurunuz.",
      });
    }
  
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Yeni şifre en az 8 karakter olmalıdır.",
      });
    }
  
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Yeni şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.",
      });
    }
  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Yeni şifreler eşleşmiyor.",
      });
    }
  
    next();
  };
  