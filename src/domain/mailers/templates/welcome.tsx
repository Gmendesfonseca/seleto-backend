type Props = {
  readonly name: string;
  readonly link: string;
};

export default function Welcome({ name, link }: Props) {
  return (
    <>
      <h1>Welcome, {name}</h1>
      <p>We are excited to have you join our platform. Click the link below to get started:</p>
      <p>
        <a href={link}>Get Started</a>
      </p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,</p>
      <p>The Team</p>
    </>
  );
}
