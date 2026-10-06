import {
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Check } from "lucide-react";
import type { Template } from "../../../data/templates";
import { useInvite } from "../../../rsvp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./Chronicle";

/* =========================================================
   The RSVP Portal — a luxurious multi-step form.
   Floating labels animate on focus, the confirmation button
   tracks the cursor magnetically, and each step transitions
   with a fluid cross-fade.
   ========================================================= */

function MagneticButton({
  children,
  type = "submit",
}: {
  children: ReactNode;
  type?: "submit" | "button";
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const onMove = (event: MouseEvent<HTMLButtonElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.24;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
    setStyle({ transform: `translate3d(${x}px, ${y}px, 0)` });
  };

  return (
    <button
      ref={ref}
      type={type}
      onMouseMove={onMove}
      onMouseLeave={() => setStyle({ transform: "translate3d(0, 0, 0)" })}
      style={style}
      className="group relative inline-flex min-h-[54px] items-center justify-center gap-2 overflow-hidden rounded-full border border-[#D4AF37]/40 bg-[#1b1a18] px-9 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-[box-shadow] duration-500 ease-out hover:shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:text-sm"
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        aria-hidden="true"
      />
      <span className="relative">{children}</span>
    </button>
  );
}

function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoFocus,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        required
        autoFocus={autoFocus}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 pb-3 pt-6 text-base text-white outline-none backdrop-blur-xl transition-colors duration-300 focus:border-[#D4AF37]/70"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-white/45 transition-all duration-300 ease-out peer-focus:top-4 peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.25em] peer-focus:text-[#D4AF37] peer-[&:not(:placeholder-shown)]:top-4 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[10px] peer-[&:not(:placeholder-shown)]:uppercase peer-[&:not(:placeholder-shown)]:tracking-[0.25em]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </label>
    </div>
  );
}

const STEPS = ["Guest", "Contact", "Party"] as const;

export function RsvpPortal({ template }: { template: Template }) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    guests: "2",
    note: "",
  });
  const invite = useInvite();
  const [error, setError] = useState("");

  const canAdvance =
    step === 0
      ? form.name.trim().length > 1
      : step === 1
        ? /.+@.+\..+/.test(form.email)
        : true;

  return (
    <section
      id="rsvp"
      className="relative bg-[#f8f6f1] py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-2xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="The RSVP Portal"
            title="Kindly Confirm Your Attendance"
          />
        </Reveal>

        <Reveal delay={140} className="mt-14">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/40 p-7 shadow-[0_40px_100px_rgba(27,26,24,0.12)] backdrop-blur-xl sm:p-10">
            {!sent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step < STEPS.length - 1) {
                    if (canAdvance) setStep(step + 1);
                    return;
                  }
                  setError("");
                  invite
                    .send({ name: form.name, email: form.email, guests: parseInt(form.guests, 10) || 1, attending: "yes", message: form.note })
                    .then(() => setSent(true))
                    .catch((err: Error) => setError(err.message));
                }}
              >
                <div className="mb-8 flex items-center justify-between gap-3">
                  {STEPS.map((label, i) => (
                    <div
                      key={label}
                      className="flex flex-1 items-center gap-3 last:flex-none"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] transition-colors duration-500 ${
                            i <= step
                              ? "border-[#D4AF37] bg-[#D4AF37] text-[#1b1a18]"
                              : "border-[#1b1a18]/20 text-[#1b1a18]/40"
                          }`}
                          style={{ fontFamily: "var(--font-label)" }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="hidden text-[10px] uppercase tracking-[0.25em] text-[#5b5852] sm:inline"
                          style={{ fontFamily: "var(--font-label)" }}
                        >
                          {label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <span
                          className={`h-px flex-1 transition-colors duration-500 ${
                            i < step ? "bg-[#D4AF37]" : "bg-[#1b1a18]/15"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div
                  key={step}
                  className="grid gap-5"
                  style={{
                    animation:
                      "vsg-step-in 560ms cubic-bezier(0.16,1,0.3,1) both",
                  }}
                >
                  {step === 0 && (
                    <>
                      <FloatingField
                        id="rsvp-name"
                        label="Full Name"
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                      />
                      <p className="text-sm leading-relaxed text-[#5b5852]">
                        We look forward to welcoming you to{" "}
                        {template.venue.name} on {template.date}.
                      </p>
                    </>
                  )}
                  {step === 1 && (
                    <FloatingField
                      id="rsvp-email"
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      autoFocus
                    />
                  )}
                  {step === 2 && (
                    <>
                      <label className="relative block">
                        <select
                          value={form.guests}
                          onChange={(e) =>
                            setForm({ ...form, guests: e.target.value })
                          }
                          className="w-full appearance-none rounded-2xl border border-white/15 bg-white/[0.5] px-5 py-4 text-base text-[#1b1a18] outline-none backdrop-blur-xl transition-colors duration-300 focus:border-[#D4AF37]/70"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "Guest" : "Guests"}
                            </option>
                          ))}
                        </select>
                        <span
                          className="pointer-events-none absolute -top-2 left-4 bg-[#f8f6f1] px-1 text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]"
                          style={{ fontFamily: "var(--font-label)" }}
                        >
                          Party Size
                        </span>
                      </label>
                      <FloatingField
                        id="rsvp-note"
                        label="Note for the Couple (optional)"
                        value={form.note}
                        onChange={(v) => setForm({ ...form, note: v })}
                      />
                    </>
                  )}
                </div>

                <div className="mt-9 flex items-center justify-between gap-4">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="text-[11px] uppercase tracking-[0.3em] text-[#5b5852] transition hover:text-[#1b1a18]"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <MagneticButton>
                    {step < STEPS.length - 1 ? "Continue" : "Send RSVP"}
                  </MagneticButton>
                </div>
                {error && (
                  <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>
                )}
              </form>
            ) : (
              <div
                className="py-4 text-center"
                style={{
                  animation:
                    "vsg-step-in 700ms cubic-bezier(0.16,1,0.3,1) both",
                }}
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]">
                  <Check size={22} />
                </div>
                <h3
                  className="mt-5 text-2xl font-semibold text-[#1b1a18]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  Thank you, {form.name || "dear guest"}.
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5b5852]">
                  Your attendance for {form.guests}{" "}
                  {Number(form.guests) === 1 ? "guest" : "guests"} has been
                  noted for {template.date}. A concierge confirmation will
                  follow shortly.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
