const nodemailer = require('nodemailer');

let transporter;

const getMailerConfig = () => ({
  user: process.env.EMAIL_USER?.trim() || '',
  // Gmail App Password: xóa toàn bộ dấu cách (người dùng thường copy có space)
  pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''),
  from: process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim() || '',
});

const isMailerConfigured = () => {
  const { user, pass } = getMailerConfig();
  return Boolean(user && pass);
};

const getTransporter = () => {
  if (!isMailerConfigured()) {
    throw new Error('Email service is not configured. Please set EMAIL_USER and EMAIL_PASS.');
  }

  if (!transporter) {
    const { user, pass } = getMailerConfig();
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return transporter;
};

const sendPasswordResetEmail = async ({ to, name, resetLink }) => {
  const mailer = getTransporter();
  const { from } = getMailerConfig();

  return mailer.sendMail({
    from,
    to,
    subject: 'Dat lai mat khau Gundam Store',
    text: `Xin chao ${name || 'ban'},\n\nBan vua yeu cau dat lai mat khau. Vui long mo lien ket sau trong 15 phut:\n${resetLink}\n\nNeu ban khong yeu cau, hay bo qua email nay.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>Dat lai mat khau</h2>
        <p>Xin chao ${name || 'ban'},</p>
        <p>Ban vua yeu cau dat lai mat khau cho tai khoan Gundam Store. Lien ket duoi day co hieu luc trong <strong>15 phut</strong>.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px">Dat lai mat khau</a>
        </p>
        <p>Neu nut khong hoat dong, hay sao chep lien ket nay vao trinh duyet:</p>
        <p>${resetLink}</p>
        <p>Neu ban khong yeu cau thao tac nay, vui long bo qua email.</p>
      </div>
    `.trim(),
  });
};

const sendOTPEmail = async (email, otp) => {
  const mailer = getTransporter();
  const { from } = getMailerConfig();

  return mailer.sendMail({
    from,
    to: email,
    subject: 'Ma xac thuc OTP tra cuu don hang Gundam Store',
    text: [
      'Xin chao,',
      '',
      `Ma OTP de xem don hang cua ban la: ${otp}`,
      'Ma co hieu luc trong 5 phut.',
      'Neu ban khong thuc hien yeu cau nay, vui long bo qua email.',
      '',
      'Gundam Store',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
        <div style="padding:24px;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff">
          <p style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#dc2626;text-transform:uppercase;margin:0 0 12px">Gundam Store</p>
          <h2 style="margin:0 0 12px;font-size:24px;color:#111827">Xac thuc tra cuu don hang</h2>
          <p style="margin:0 0 16px;color:#4b5563">Chung toi vua nhan duoc yeu cau xem lich su don hang guest cua ban. Hay nhap ma OTP ben duoi de tiep tuc.</p>
          <div style="margin:24px 0;padding:18px 20px;background:#f9fafb;border-radius:14px;border:1px dashed #d1d5db;text-align:center">
            <div style="font-size:30px;letter-spacing:0.35em;font-weight:700;color:#111827">${otp}</div>
            <div style="margin-top:8px;font-size:13px;color:#6b7280">Ma co hieu luc trong 5 phut</div>
          </div>
          <p style="margin:0 0 8px;color:#4b5563">De bao mat, vui long khong chia se ma nay cho bat ky ai.</p>
          <p style="margin:0;color:#6b7280">Neu ban khong yeu cau thao tac nay, ban co the bo qua email.</p>
        </div>
      </div>
    `.trim(),
  });
};

module.exports = {
  isMailerConfigured,
  sendPasswordResetEmail,
  sendOTPEmail,
};