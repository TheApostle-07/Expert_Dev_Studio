"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageSquareText } from "lucide-react";

export default function LeadCatcherThanksPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const [booking, setBooking] = useState<any | null>(null);
  const bookingId = searchParams.booking;
  const contact = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 95103 94742";

  useEffect(() => {
    const url = bookingId
      ? `/api/sprint/booking?bookingId=${bookingId}`
      : "/api/sprint/booking";
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBooking(data?.booking || null))
      .catch(() => setBooking(null));
  }, [bookingId]);

  const message = booking?.bookingCode
    ? `Booked Sprint — ${booking.bookingCode}`
    : "Booked Sprint";
  const whatsappLink = `https://wa.me/${contact.replace(/\D/g, "")}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="min-h-screen bg-transparent text-black">
      <div className="page-shell pb-16 pt-24 sm:pt-28 md:pt-32">
        <div className="rounded-3xl border border-black/10 bg-white/90 p-6 text-center shadow-[0_18px_50px_-30px_rgba(0,0,0,0.25)]">
          <CheckCircle2 className="mx-auto h-10 w-10 text-cerulean" />
          <h1 className="mt-3 text-3xl font-semibold text-prussian">Booking confirmed</h1>
          <p className="mt-2 text-sm text-black/70">
            Your slot is reserved. Next step: submit your intake.
          </p>
          {booking ? (
            <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
              <p>
                Booking ID: <strong>{booking.bookingCode}</strong>
              </p>
              {booking.slotStart ? (
                <p className="mt-1 text-xs text-black/50">
                  Slot:{" "}
                  {new Intl.DateTimeFormat("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(booking.slotStart))}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/lead-catcher-sprint/intake"
              className="inline-flex items-center justify-center rounded-xl bg-prussian px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-prussian/90"
            >
              Submit intake
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-prussian shadow-[0_6px_18px_-12px_rgba(0,0,0,0.25)] transition hover:bg-black/5"
            >
              <MessageSquareText className="h-4 w-4 text-cerulean" />
              WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
