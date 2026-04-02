import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    console.log("📧 Attempting to send email to:", to)
  
    const info =await transporter.sendMail({
      from: `"Car Rental Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.response);

  } catch (error) {
    console.error("Full Email Error:", error);
  }
};