"use client";

import { useActionState } from "react";
import {
  sendContactMessage,
  type ContactState,
} from "@/app/contact/actions";

const initial: ContactState = { ok: false, error: null };

export function ContactForm() {
  const [state, action, pending] = useActionState(
    sendContactMessage,
    initial,
  );

  if (state.ok) {
    return (
      <p className="contact-form-thanks" role="status">
        Thanks, I’ll be in touch soon.
      </p>
    );
  }

  return (
    <form action={action} className="contact-form">
      <div className="contact-form-row">
        <label className="contact-field-wrap">
          <span className="contact-label">Name</span>
          <input
            className="contact-field"
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            disabled={pending}
          />
        </label>
        <label className="contact-field-wrap">
          <span className="contact-label">Email</span>
          <input
            className="contact-field"
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={120}
            disabled={pending}
          />
        </label>
      </div>

      <label className="contact-field-wrap">
        <span className="contact-label">Project</span>
        <select
          className="contact-field"
          name="project"
          defaultValue=""
          disabled={pending}
        >
          <option value="">What are you looking for?</option>
          <option value="Branding">Branding</option>
          <option value="Logos">Logos</option>
          <option value="Advertising">Advertising</option>
          <option value="Other">Something else</option>
        </select>
      </label>

      <label className="contact-field-wrap">
        <span className="contact-label">Message</span>
        <textarea
          className="contact-field contact-field-area"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          disabled={pending}
        />
      </label>

      <div className="contact-honey" aria-hidden="true">
        <label>
          Company website
          <input
            type="text"
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {state.error ? (
        <p className="contact-form-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button className="contact-submit" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
