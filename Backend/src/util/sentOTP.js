import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendOtpMail = async (email, otp) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
