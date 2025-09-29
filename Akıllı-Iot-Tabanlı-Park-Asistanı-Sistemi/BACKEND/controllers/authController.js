import User from '../models/userModel.js'; // ✅ doğru
import bcrypt from 'bcryptjs';

// LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Lütfen e-posta veya şifrenizi giriniz."
        
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Kullanıcı bulunamadı."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Geçersiz kullanıcı."
      });
    }

    const token = user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        sameSite: process.env.NODE_ENV === "development" ? true : false
      })
      .send({
        success: true,
        message: "Login successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phoneNumber: user.phoneNumber
        },
      });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Login Api",
      error
    });
  }
};

// LOGOUT
export const logoutController = async (req, res) => {
  try {
    res.status(200).cookie("token", "", {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      secure: process.env.NODE_ENV === "development" ? true : false,
      httpOnly: process.env.NODE_ENV === "development" ? true : false,
      sameSite: process.env.NODE_ENV === "development" ? true : false
    }).send({
      success: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In LogOut API",
      error,
    });
  }
};
