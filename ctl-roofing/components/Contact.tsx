"use client";

/**
 * The request sheet. Four fields and a note — an assessment request is
 * a phone call waiting to happen, not an intake questionnaire, so the
 * form asks only what a dispatcher needs to call back: who, what
 * number, which property, and what they're seeing.
 */
import { useState, type FormEvent } from "react";
import { client } from "@/client.config";
import { submitContact } from "@/lib/submitContact";
import { trackEvent } from "@/lib/tracking";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";
import { btn } from "./Button";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY = {
  name: "",
  phone: "",
  address: "",
  service: client.form.serviceOptions[0],
  message: "",
  company: "", // honeypot
};

const REQUIRED = [
  { key: "name", label: "Enter your name so we know who to ask for." },
  { key: "phone", label: "Enter a phone number we can reach you on." },
  { key: "address", label: "Enter the address of the property." },
] as const;

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<string[]>([]);
  const [form, setForm] = useState<Record<string, string>>(EMPTY);

  const set = (key: string) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
    if (value.trim()) setInvalid((v) => v.filter((k) => k !== key));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = REQUIRED.filter((r) => !form[r.key].trim()).map((r) => r.key);
    setInvalid(missing);
    if (missing.length) {
      document.getElementById(`field-${missing[0]}`)?.focus();
      return;
    }

    setStatus("sending");
    setError("");
    const result = await submitContact({
      name: form.name,
      phone: form.phone,
      email: "",
      address: form.address,
      service: form.service,
      urgency: "",
      message: form.message,
      company: form.company,
    });
    if (result.ok) {
      setStatus("sent");
      setForm(EMPTY);
      trackEvent("Form submit", { service: form.service });
    } else {
      setError(result.error);
      setStatus("error");
    }
  }

  const field =
    "w-full rounded border bg-surface px-3.5 py-3 text-base text-ink " +
    "transition-colors duration-150 placeholder:text-ink-faint hover:border-brand-soft focus:border-brand active:border-brand";
  const tone = (key: string) =>
    invalid.includes(key) ? "border-danger bg-danger-soft" : "border-line";

  return (
    <section id="contact" className="band bg-surface-alt">
      <div className="section grid gap-[clamp(30px,5vw,72px)] md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHead
            heading={client.copy.contactHeading}
            lede={client.copy.contactLede}
          />

          <Reveal delay={0.06}>
            <form onSubmit={onSubmit} noValidate className="mt-10">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="u-label mb-1.5 block">Your name</span>
                  <input
                    id="field-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    maxLength={100}
                    value={form.name}
                    onChange={set("name")}
                    aria-invalid={invalid.includes("name")}
                    className={`${field} ${tone("name")}`}
                  />
                  {invalid.includes("name") && (
                    <span className="mt-1.5 block text-sm text-danger">
                      {REQUIRED[0].label}
                    </span>
                  )}
                </label>

                <label className="block">
                  <span className="u-label mb-1.5 block">Phone</span>
                  <input
                    id="field-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={30}
                    value={form.phone}
                    onChange={set("phone")}
                    aria-invalid={invalid.includes("phone")}
                    className={`${field} ${tone("phone")} font-mono tabular-nums`}
                  />
                  {invalid.includes("phone") && (
                    <span className="mt-1.5 block text-sm text-danger">
                      {REQUIRED[1].label}
                    </span>
                  )}
                </label>
              </div>

              <label className="mt-4 block">
                <span className="u-label mb-1.5 block">Property address</span>
                <input
                  id="field-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  maxLength={160}
                  value={form.address}
                  onChange={set("address")}
                  aria-invalid={invalid.includes("address")}
                  className={`${field} ${tone("address")}`}
                />
                {invalid.includes("address") && (
                  <span className="mt-1.5 block text-sm text-danger">
                    {REQUIRED[2].label}
                  </span>
                )}
              </label>

              <label className="mt-4 block">
                <span className="u-label mb-1.5 block">What do you need?</span>
                <select
                  name="service"
                  value={form.service}
                  onChange={set("service")}
                  className={`${field} ${tone("service")} cursor-pointer`}
                >
                  {client.form.serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="u-label mb-1.5 block">Anything we should know</span>
                <textarea
                  name="message"
                  rows={4}
                  maxLength={2000}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Water spot on the ceiling, missing shingles after the last storm, age of the roof…"
                  className={`${field} ${tone("message")} resize-none`}
                />
              </label>

              {/* Honeypot — visually hidden, bots fill it */}
              <label className="absolute -left-[9999px]" aria-hidden tabIndex={-1}>
                Company
                <input
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.company}
                  onChange={set("company")}
                />
              </label>

              <button type="submit" disabled={status === "sending"} className={`mt-6 ${btn("gold")} disabled:cursor-not-allowed disabled:border-line disabled:bg-surface-alt disabled:text-ink-faint`}>
                {status === "sending" ? "Sending…" : client.copy.contactSubmit}
              </button>

              {client.bookingUrl && (
                <p className="mt-4 text-sm text-ink-faint">
                  Prefer to pick your own time?{" "}
                  <a
                    href={client.bookingUrl}
                    className="border-b-2 border-accent text-ink no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
                  >
                    Book directly on the calendar
                  </a>
                  .
                </p>
              )}

              <p role="status" aria-live="polite">
                {status === "sent" && (
                  <span className="mt-4 block rounded border border-l-4 border-brand border-l-accent bg-surface px-4 py-4 text-ink">
                    {client.copy.contactConfirmation} If this is an emergency, call
                    the storm line at{" "}
                    <a
                      href={`tel:${client.stormPhoneHref}`}
                      className="font-mono font-semibold tabular-nums text-brand no-underline hover:underline active:text-brand-strong"
                    >
                      {client.stormPhone}
                    </a>
                    .
                  </span>
                )}
                {status === "error" && (
                  <span className="mt-4 block border-l-2 border-danger pl-3 text-sm font-medium text-danger">
                    {error}{" "}
                    {/* A failed submit is the one moment the phone number
                        has to be right there, not back up the page. */}
                    <a
                      href={`tel:${client.phoneHref}`}
                      className="font-mono font-semibold tabular-nums text-danger underline underline-offset-4"
                    >
                      {client.phone}
                    </a>
                  </span>
                )}
              </p>
            </form>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-3">
            <dt className="u-label">Office</dt>
            <dd className="m-0 text-[17px] text-ink">
              <a
                href={`tel:${client.phoneHref}`}
                className="border-b-2 border-accent font-mono tabular-nums no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
              >
                {client.phone}
              </a>
            </dd>

            <dt className="u-label">Storm line</dt>
            <dd className="m-0 text-[17px] text-ink">
              <a
                href={`tel:${client.stormPhoneHref}`}
                className="border-b-2 border-accent font-mono tabular-nums no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
              >
                {client.stormPhone}
              </a>
            </dd>

            <dt className="u-label">Email</dt>
            <dd className="m-0 text-[17px] text-ink">
              <a
                href={`mailto:${client.email}`}
                className="border-b-2 border-accent no-underline transition-colors duration-150 hover:text-brand active:text-brand-strong"
              >
                {client.email}
              </a>
            </dd>

            <dt className="u-label">Showroom</dt>
            <dd className="m-0 text-[17px] text-ink">
              {client.address.street}
              <br />
              {client.address.city}, {client.address.region} {client.address.postalCode}
            </dd>
          </dl>

          <table className="mt-10 w-full border-collapse border-t border-line text-base">
            <caption className="u-label pt-6 text-left">Hours</caption>
            <tbody>
              {client.hours.map((h) => (
                <tr key={h.days}>
                  <td className="border-b border-line py-2 text-ink">{h.days}</td>
                  <td className="border-b border-line py-2 text-right font-mono text-[13px]">
                    {h.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {client.mapEmbedSrc && (
            <iframe
              src={client.mapEmbedSrc}
              title={`Map to ${client.businessName}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-10 h-52 w-full rounded border border-line"
            />
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.contactPhoto.src}
            width={820}
            height={379}
            alt={client.contactPhoto.alt}
            loading="lazy"
            className="mt-10 w-full rounded"
          />
        </Reveal>
      </div>
    </section>
  );
}
