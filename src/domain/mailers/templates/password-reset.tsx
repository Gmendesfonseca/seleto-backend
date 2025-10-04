type Props = {
  readonly link: string;
};

export default function PasswordReset({ link }: Props) {
  return (
    <>
      <h1>Password Reset Request</h1>
      <p>Hello,</p>
      <p>
        We received a request to reset your password. Click the link below to reset your password:
      </p>
      <p>
        <a
          href={link}
          style={{
            color: '#007bff',
            textDecoration: 'none',
          }}
        >
          Reset Password
        </a>
      </p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,</p>
      <p>Your Company Team</p>
    </>
  );
}
