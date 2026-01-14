"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";

type LeadRow = {
  id: string;
  name?: string;
  email?: string;
  prizeLabel: string;
  paymentStatus: string;
  status: string;
  priceInr: number;
  amountPaidInr?: number;
  createdAt: string;
  acceptedAt?: string;
  expiresAt?: string;
  notes?: string;
  events?: Array<{
    type: string;
    orderId?: string;
    paymentId?: string;
    amountInr?: number;
    createdAt: string;
  }>;
};

const STATUS_OPTIONS = ["NEW", "ONBOARDING", "IN_PROGRESS", "DELIVERED"];

export default function AdminLeadsTable({
  leads,
  token,
}: {
  leads: LeadRow[];
  token: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (leadId: string, status: string) => {
    setUpdating(leadId);
    try {
      await fetch(`/api/admin/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white/90 p-5 shadow-[0_14px_36px_-26px_rgba(0,0,0,0.25)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.2em] text-black/50">
              <th className="py-3">Lead</th>
              <th className="py-3">Offer</th>
              <th className="py-3">Payment</th>
              <th className="py-3">Status</th>
              <th className="py-3">Created</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.map((lead) => {
              const isOpen = expanded === lead.id;
              return (
                <tr key={lead.id} className="align-top">
                  <td className="py-4 pr-4">
                    <div className="text-sm font-semibold text-prussian">
                      {lead.name || "Unnamed"}
                    </div>
                    <div className="text-xs text-black/60">{lead.email || "—"}</div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-sm text-black/80">{lead.prizeLabel}</div>
                    <div className="text-xs text-black/50">
                      ₹{lead.priceInr.toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="text-sm font-semibold text-black/80">
                      {lead.paymentStatus}
                    </div>
                    <div className="text-xs text-black/50">
                      Paid: ₹{(lead.amountPaidInr || 0).toLocaleString("en-IN")}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <select
                      value={lead.status}
                      onChange={(event) => updateStatus(lead.id, event.target.value)}
                      disabled={updating === lead.id}
                      className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs font-semibold text-prussian"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 pr-4 text-xs text-black/60">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : lead.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-prussian shadow-[0_4px_16px_-10px_rgba(0,0,0,0.2)]"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {expanded ? (
        <div className="mt-5 rounded-2xl border border-black/10 bg-white px-5 py-4">
          {leads
            .filter((lead) => lead.id === expanded)
            .map((lead) => (
              <div key={lead.id} className="grid gap-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-black/60">
                  <span>Accepted: {lead.acceptedAt ? new Date(lead.acceptedAt).toLocaleString() : "—"}</span>
                  <span>Expires: {lead.expiresAt ? new Date(lead.expiresAt).toLocaleString() : "—"}</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Notes</p>
                  <p className="mt-2 text-sm text-black/70">{lead.notes || "No notes yet."}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/50">Events</p>
                  <div className="mt-3 grid gap-2 text-sm text-black/70">
                    {(lead.events || []).map((event, index) => (
                      <div
                        key={`${lead.id}-event-${index}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2"
                      >
                        <span className="font-semibold text-prussian">{event.type}</span>
                        <span className="text-xs text-black/50">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                        <span className="text-xs text-black/60">
                          {event.amountInr ? `₹${event.amountInr}` : "—"}
                        </span>
                      </div>
                    ))}
                    {(lead.events || []).length === 0 ? (
                      <p className="text-xs text-black/50">No events recorded.</p>
                    ) : null}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-black/50">
                  <Pencil className="h-4 w-4" />
                  Update status dropdown to keep team aligned.
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
