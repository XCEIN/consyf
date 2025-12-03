import * as yup from "yup";

export const loginSchema = yup
  .object({
    username: yup.string().min(5, "Tên tài khoản ít nhất 5 ký tự").required(),
    password: yup.string().min(8, "Mật khẩu ít nhất 8 ký tự").required(),
  })
  .required();
export type LoginType = yup.InferType<typeof loginSchema>;


export const registerSchema = yup.object({
  name: yup.string().required("Vui lòng nhập tên tài khoản"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  phone: yup
    .string()
    .matches(/^(0|\+84)\d{9,10}$/, "Số điện thoại không hợp lệ")
    .required("Vui lòng nhập số điện thoại"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .matches(
      /(?=.*[A-Z])|(?=.*[!@#$%^&*])/,
      "Phải có ký tự đặc biệt hoặc viết hoa"
    )
    .required("Vui lòng nhập mật khẩu"),
});
export type RegisterType = {
  name: string;
  email: string;
  phone: string;
  password: string;
};