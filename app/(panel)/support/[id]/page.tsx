"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { apiPaths } from "@/lib/endpoints";
import { fullName } from "@/lib/format";
import { http } from "@/lib/http";
import { useAction } from "@/lib/use-action";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/use-query";
import type { SupportTicket } from "@/lib/types";
import { Alert, Loading, Notices, PageHeader, Screen } from "@/components/ui";

export default function SupportTicketPage() {
  const params = useParams<{ id: string }>();
  const { can } = useAuth();
  const action = useAction();
  const ticketQuery = useQuery<{ ticket: SupportTicket }>(apiPaths.ticket(params.id));
  const [body, setBody] = useState("");
  const ticket = ticketQuery.data?.ticket ?? null;
  const canReply = can("support.reply");

  async function onReply(event: FormEvent) {
    event.preventDefault();
    if (!ticket || !body.trim()) return;
    const text = body.trim();
    await action.run(async () => {
      const response = await http.post<{ ticket: SupportTicket }>(apiPaths.ticketMessages(ticket.id), { body: text });
      ticketQuery.setData({ ticket: response.items.ticket });
      setBody("");
      return response.message;
    }, "ثبت پاسخ انجام نشد.");
  }

  async function changeStatus(actionName: "close" | "reopen") {
    if (!ticket) return;
    const path = actionName === "close" ? apiPaths.ticketClose(ticket.id) : apiPaths.ticketReopen(ticket.id);
    await action.run(async () => {
      const response = await http.post<{ ticket: SupportTicket }>(path);
      ticketQuery.setData({ ticket: response.items.ticket });
      return response.message;
    }, "تغییر وضعیت انجام نشد.");
  }

  if (!ticket) return ticketQuery.error ? <Alert kind="error">{ticketQuery.error}</Alert> : <Loading />;

  return (
    <Screen>
      <Link href="/support" className="text-sm text-primary">بازگشت به صف</Link>
      <PageHeader
        title={ticket.subject}
        description={`${ticket.category_label} · ${ticket.status_label}`}
        action={canReply && ticket.status !== "closed" ? (
          <button className="btn btn-ghost" type="button" disabled={action.pending} onClick={() => void changeStatus("close")}>بستن</button>
        ) : null}
      />
      {ticket.user ? (
        <p className="text-sm text-muted">
          {fullName(ticket.user)}
          {ticket.user.mobile ? <span className="mr-2" dir="ltr">{ticket.user.mobile}</span> : null}
        </p>
      ) : null}
      <Notices message={action.message} error={action.error} />
      <div className="grid gap-3">
        {(ticket.messages ?? []).map((message) => (
          <article key={message.id} className="card p-4">
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span className="font-bold text-ink">{message.author_name}</span>
              <span>{message.author_side === "staff" ? "پشتیبان" : "کاربر"}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
          </article>
        ))}
      </div>
      {canReply && ticket.status === "closed" ? (
        <button className="btn btn-primary" type="button" disabled={action.pending} onClick={() => void changeStatus("reopen")}>باز کردن</button>
      ) : null}
      {canReply && ticket.status !== "closed" ? (
        <form className="grid gap-3" onSubmit={(event) => void onReply(event)}>
          <textarea className="field min-h-28" value={body} maxLength={4000} onChange={(event) => setBody(event.target.value)} placeholder="پاسخ پشتیبانی" />
          <button className="btn btn-primary" type="submit" disabled={action.pending || body.trim() === ""}>ارسال پاسخ</button>
        </form>
      ) : null}
    </Screen>
  );
}
