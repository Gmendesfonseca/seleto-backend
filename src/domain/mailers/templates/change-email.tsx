type Props = {
  readonly link: string;
};

export default function ChangeEmail({ link }: Props) {
  return (
    <>
      <h1>Change Your Email</h1>
      <p>Hello,</p>
      <p>
        We received a request to change your email address. If you made this request, please click
        the link below to proceed:
      </p>
      <p>
        <a href={link} target="_blank">
          Change Email
        </a>
      </p>
      <p>If you did not request this change, you can safely ignore this email.</p>
      <p>Thank you,</p>
      <p>Your Company Team</p>
    </>
  );
}
