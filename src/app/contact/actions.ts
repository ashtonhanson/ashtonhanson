"use server";

import { headers } from "next/headers";
import { contact } from "@/lib/content";

export type ContactState = {
  ok: boolean;
  error: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function recentHits(key: string, now: number) {
  const next = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(key, next);
  return next;
}

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function escapeText(value: string) {
  return value.replace(/\r\n/g, "\n").slice(0, 4000);
}

async function clientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

async function sendWithResend(input: {
  name: string;
  email: string;
  project: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Ashton Hanson Design <onboarding@resend.dev>";
  const projectLine = input.project ? `Project: ${input.project}\n` : "";
  const text = `From: ${input.name} <${input.email}>\n${projectLine}\n${input.message}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `Inquiry from ${input.name}`,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Resend rejected the message.");
  }
  return true;
}

async function sendWithFormsubmit(input: {
  name: string;
  email: string;
  project: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL || contact.email;
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        project: input.project || "—",
        message: input.message,
        _subject: `Inquiry from ${input.name}`,
        _template: "table",
        _captcha: "false",
        _replyto: input.email,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Could not deliver the message.");
  }
}

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const honey = read(formData, "company_url");
  if (honey) {
    return { ok: true, error: null };
  }

  const name = escapeText(read(formData, "name")).slice(0, 80);
  const email = read(formData, "email").slice(0, 120);
  const project = escapeText(read(formData, "project")).slice(0, 80);
  const message = escapeText(read(formData, "message"));

  if (name.length < 2) {
    return { ok: false, error: "Please add your name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Please use a valid email." };
  }
  if (message.length < 10) {
    return { ok: false, error: "Please write a little more in your message." };
  }

  const now = Date.now();
  const key = await clientKey();
  const log = recentHits(key, now);
  if (log.length >= MAX_PER_WINDOW) {
    return { ok: false, error: "Please wait a few minutes and try again." };
  }
  log.push(now);
  hits.set(key, log);

  try {
    const sent = await sendWithResend({ name, email, project, message });
    if (!sent) {
      await sendWithFormsubmit({ name, email, project, message });
    }
    return { ok: true, error: null };
  } catch {
    return {
      ok: false,
      error: "Something went wrong sending that. Please try again.",
    };
  }
}
