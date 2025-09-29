import * as Yup from "yup";

export const UserSchema = Yup.object({
  name: Yup.string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olmalıdır")
    .required("İsim alanı zorunludur"),
  surname: Yup.string()
    .min(2, "Soyisim en az 2 karakter olmalıdır")
    .max(50, "Soyisim en fazla 50 karakter olmalıdır")
    .required("Soyisim alanı zorunludur"),
  username: Yup.string()
    .min(4, "Kullanıcı adı en az 4 karakter olmalıdır")
    .max(30, "Kullanıcı adı en fazla 30 karakter olmalıdır")
    .required("Kullanıcı adı alanı zorunludur"),
  email: Yup.string()
    .email("Geçerli bir e-posta adresi girin")
    .required("E-posta adresi alanı zorunludur"),
  phoneNumber: Yup.string()
    .matches(
      /^(\+?\d{1,4}[-.\s]?)?\d{10}$/,
      "Geçerli bir telefon numarası girin"
    )
    .required("Telefon numarası zorunludur"),
  city: Yup.string()
    .min(3, "Şehir adı en az 3 karakter olmalıdır")
    .max(50, "Şehir adı en fazla 50 karakter olmalıdır")
    .required("Şehir alanı zorunludur"),
});
