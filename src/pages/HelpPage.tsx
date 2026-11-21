import { useState } from "preact/hooks";
import { ChevronDown, Mail, MessageCircle, Search } from "lucide-preact";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Link } from "@/components/ui/Link";
import { TextField } from "@/components/ui/TextField";

const FAQS = [
  {
    question: "How do I find my booking reference?",
    answer:
      "Your reference (AT-XXXXXX) appears on the confirmation page after booking. If you created an account, it is also listed under My Account → Your bookings. You can always look it up with the email used at booking on the My Trips page.",
  },
  {
    question: "Can I change passenger details after booking?",
    answer:
      "Contact details can be updated from My Trips. Names and dates of birth are part of the ticket and require a new booking in this demo — there is no name-change desk.",
  },
  {
    question: "How do cancellations and refunds work?",
    answer:
      "Open My Trips, find your booking and choose Cancel booking. The status changes to cancelled and the seats return to inventory immediately. This demo does not collect payment, so there is nothing to refund.",
  },
  {
    question: "Is my payment information stored?",
    answer:
      "No. The review step is a demonstration only — no card details are transmitted, stored or charged. AeroTrip confirms bookings instantly without taking payment.",
  },
  {
    question: "Do I need an account to book?",
    answer:
      "No. Guest checkout is fully supported. Creating an account simply keeps your bookings and profile together so you can skip the reference + email lookup.",
  },
];

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);
  const filtered = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query.toLowerCase()) ||
      faq.answer.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Container class="max-w-5xl py-10 sm:py-14">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">
        Help center
      </p>
      <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
        How can we help?
      </h1>
      <p class="mt-2 text-sm text-navy-500">
        Answers to the questions travelers ask us most.
      </p>

      <div class="mt-8 max-w-xl">
        <TextField
          label="Search help articles"
          value={query}
          onInput={setQuery}
          placeholder="Try “cancel” or “reference”"
        />
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section class="rounded-3xl border border-navy-100 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 class="text-lg font-bold text-navy-900">Frequently asked questions</h2>
          <div class="mt-4 divide-y divide-navy-100">
            {filtered.map((faq) => {
              const index = FAQS.indexOf(faq);
              return (
                <div key={faq.question} class="py-3">
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-navy-900"
                    aria-expanded={open === index}
                    onClick={() => setOpen(open === index ? null : index)}
                  >
                    {faq.question}
                    <ChevronDown
                      class={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${
                        open === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {open === index ? (
                    <p class="mt-2 text-sm leading-relaxed text-navy-500">{faq.answer}</p>
                  ) : null}
                </div>
              );
            })}
            {filtered.length === 0 ? (
              <p class="py-6 text-sm text-navy-400">
                No articles match “{query}”. Try another word or contact us below.
              </p>
            ) : null}
          </div>
        </section>

        <aside class="space-y-4">
          <div class="rounded-3xl border border-navy-100 bg-navy-50/70 p-5">
            <MessageCircle class="h-5 w-5 text-sky-600" />
            <h2 class="mt-3 text-base font-bold text-navy-900">Find a booking</h2>
            <p class="mt-1 text-xs text-navy-500">
              Use your reference and email to view or cancel a trip.
            </p>
            <Button href="/manage" size="sm" class="mt-4 w-full">
              My Trips
            </Button>
          </div>
          <div class="rounded-3xl border border-navy-100 bg-white p-5">
            <Mail class="h-5 w-5 text-sky-600" />
            <h2 class="mt-3 text-base font-bold text-navy-900">Still stuck?</h2>
            <p class="mt-1 text-xs text-navy-500">
              Our support desk replies within one business day.
            </p>
            <a
              href="mailto:support@aerotrip.example"
              class="mt-4 inline-flex text-xs font-bold text-sky-600 hover:underline"
            >
              support@aerotrip.example
            </a>
          </div>
          <Link
            href="/"
            class="flex items-center gap-2 text-xs font-semibold text-navy-500 hover:text-navy-900"
          >
            <Search class="h-3.5 w-3.5" /> Back to flight search
          </Link>
        </aside>
      </div>
    </Container>
  );
}
