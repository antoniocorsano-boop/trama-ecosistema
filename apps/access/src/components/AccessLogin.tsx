import { useState, type FormEvent } from 'react';

export function AccessLogin({
  onRequestLink,
}: {
  onRequestLink(email: string): void | Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onRequestLink(email.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="access-form" onSubmit={submit}>
      <label className="access-label" htmlFor="professional-email">
        Email professionale
      </label>
      <input
        id="professional-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={320}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="access-input"
      />
      <button className="access-primary-action" type="submit" disabled={submitting}>
        {submitting ? 'Invio in corso…' : 'Accedi'}
      </button>
    </form>
  );
}
