import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { Op } from "sequelize";
// Helper: Email formatı kontrolü
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

// REGISTER
export const registerController = async (req, res) => {
  try {
    const { name, surname, email, password, confirmPassword, phoneNumber } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "İsim alanını doldurunuz!" });
    }

    if (!surname) {
      return res.status(400).json({ success: false, message: "Soyisim alanını doldurunuz!" });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "E-posta alanını doldurunuz!" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Şifre alanını doldurunuz!" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ success: false, message: "Şifre tekrar alanını doldurunuz!" });
    }

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Telefon numarası alanını doldurunuz!" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Şifreler eşleşmiyor!" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Bu e-posta zaten kayıtlı!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "Kayıt başarılı, lütfen giriş yapın!",
      user: {
        name: newUser.name,
        surname: newUser.surname,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Register API'de hata oluştu!", error });
  }
};


// GET USER PROFILE (JWT ile gelen kullanıcı)
export const getUserProfileController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const { password, ...userData } = user.toJSON();
    res.status(200).json({ success: true, message: "Profil getirildi", user: userData });

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Profil API hatası", error });
  }
};

// UPDATE PROFILE
export const updateProfileController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const {
      name,
      surname,
      phoneNumber,
      email,       // mevcut email
      newEmail,    // yeni email (eğer varsa)
      password     // doğrulama şifresi
    } = req.body;

    // Yeni email güncellemesi isteniyorsa
    if (newEmail) {
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "E-posta güncellemesi için mevcut e-posta ve şifre gerekli." });
      }

      // Email doğrulama
      if (email !== user.email) {
        return res.status(400).json({ success: false, message: "Mevcut e-posta eşleşmiyor." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Şifre doğrulanamadı." });
      }

      // Yeni email format ve benzersizlik kontrolü
      if (!isValidEmail(newEmail)) {
        return res.status(400).json({ success: false, message: "Geçersiz yeni e-posta formatı" });
      }

      const existingEmail = await User.findOne({
        where: {
          email: newEmail,
          id: { [Op.ne]: req.user.id },
        },
      });

      if (existingEmail) {
        return res.status(400).json({ success: false, message: "Bu e-posta adresi zaten kullanımda" });
      }

      user.email = newEmail;
    }

    // // Kullanıcı adı benzersizlik kontrolü
    // if (username && username !== user.username) {
    //   const existingUsername = await User.findOne({
    //     where: {
    //       username,
    //       id: { [Op.ne]: req.user.id },
    //     },
    //   });

    //   if (existingUsername) {
    //     return res.status(400).json({ success: false, message: "Bu kullanıcı adı zaten kullanımda" });
    //   }

    //   user.username = username;
    // }

    // Diğer alanlar dinamik olarak güncelleniyor
    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    return res.status(200).json({ success: true, message: "Profil başarıyla güncellendi" });

  } catch (error) {
    console.error("Profile Update Error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "e-posta zaten kullanımda",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Profil güncelleme hatası",
      error,
    });
  }
};

// UPDATE PASSWORD
export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Lütfen tüm şifre alanlarını doldurun" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Yeni şifreler eşleşmiyor" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Eski şifre hatalı" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ success: true, message: "Şifre başarıyla güncellendi" });

  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ success: false, message: "Şifre güncelleme hatası", error });
  }
};

// GET USER BY ID (sadece /user/:id için)
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    const { password, ...userData } = user.toJSON();
    res.status(200).json({ success: true, message: "Kullanıcı bilgisi getirildi", user: userData });

  } catch (error) {
    console.error("User Fetch Error:", error);
    res.status(500).json({ success: false, message: "Kullanıcı getirme hatası", error });
  }
};

// DELETE USER (JWT ile gelen kullanıcı)
export const deleteUserController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: "Kullanıcı başarıyla silindi" });

  } catch (error) {
    console.error("User Delete Error:", error);
    res.status(500).json({ success: false, message: "Kullanıcı silme hatası", error });
  }
};
