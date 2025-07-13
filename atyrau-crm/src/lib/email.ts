// This is a placeholder for actual email sending implementation
// In a real app, you would integrate with a service like SendGrid, Mailgun, etc.

/**
 * Sends an email verification link to the user
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  console.log(`[Email Service] Sending verification email to ${email}`);
  console.log(`[Email Service] Verification URL: ${verificationUrl}`);

  // In development, we'll just log the email instead of sending it
  if (process.env.NODE_ENV === "development") {
    console.log(`
      To: ${email}
      Subject: Подтвердите ваш email
      
      Здравствуйте, ${name}!
      
      Спасибо за регистрацию на нашей платформе. Пожалуйста, подтвердите ваш email, перейдя по ссылке ниже:
      
      ${verificationUrl}
      
      Ссылка действительна в течение 24 часов.
      
      С уважением,
      Команда Atyrau Business Platform
    `);
    return;
  }

  // In production, send real email
  // Example implementation with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: 'noreply@atyrauplatform.kz',
    subject: 'Подтвердите ваш email',
    text: `Здравствуйте, ${name}! Пожалуйста, подтвердите ваш email: ${verificationUrl}`,
    html: `
      <div>
        <h1>Здравствуйте, ${name}!</h1>
        <p>Спасибо за регистрацию на нашей платформе. Пожалуйста, подтвердите ваш email, перейдя по ссылке ниже:</p>
        <p><a href="${verificationUrl}">Подтвердить email</a></p>
        <p>Ссылка действительна в течение 24 часов.</p>
        <p>С уважением,<br>Команда Atyrau Business Platform</p>
      </div>
    `,
  };
  
  await sgMail.send(msg);
  */
}

/**
 * Sends a password reset link to the user
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  console.log(`[Email Service] Sending password reset email to ${email}`);
  console.log(`[Email Service] Reset URL: ${resetUrl}`);

  // In development, we'll just log the email
  if (process.env.NODE_ENV === "development") {
    console.log(`
      To: ${email}
      Subject: Сброс пароля
      
      Здравствуйте, ${name}!
      
      Вы запросили сброс пароля. Пожалуйста, перейдите по ссылке ниже, чтобы задать новый пароль:
      
      ${resetUrl}
      
      Ссылка действительна в течение 1 часа.
      
      Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
      
      С уважением,
      Команда Atyrau Business Platform
    `);
    return;
  }

  // Implementation for production...
}

/**
 * Sends an appointment confirmation email
 */
export async function sendAppointmentConfirmation(
  email: string,
  name: string,
  appointment: any
) {
  // Implementation for sending appointment confirmations...
}
