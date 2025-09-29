import User from '../models/userModel.js';

export const validateUserMiddleware = async (req, res, next) => {
  const { name, surname, email, password, phoneNumber } = req.body;

  // Eğer name alanı varsa, kontrol et
  if (name && !name.trim()) {
    return res.status(400).json({ success: false, message: "İsim (name) alanı boş olamaz." });
  }

  // Eğer surname alanı varsa, kontrol et
  if (surname && !surname.trim()) {
    return res.status(400).json({ success: false, message: "Soyisim (surname) alanı boş olamaz." });
  }

  // Eğer email alanı varsa, kontrol et
  if (email && !email.trim()) {
    return res.status(400).json({ success: false, message: "E-posta (email) alanı boş olamaz." });
  }

  // Eğer password alanı varsa, kontrol et
  if (password && password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Şifre en az 8 karakter olmalıdır."
    });
  }

  // Eğer password regexi geçerli değilse kontrol et
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (password && !passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message: "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir."
    });
  }

  // Eğer phoneNumber varsa, kontrol et
  if (phoneNumber && !phoneNumber.trim()) {
    return res.status(400).json({ success: false, message: "Telefon numarası (phoneNumber) alanı boş olamaz." });
  }

  // Tüm kontroller geçerse middleware'i geçiyoruz
  next();
};
