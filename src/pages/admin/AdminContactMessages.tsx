import { useState } from "react";
import { Mail, Check, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type ContactMessage } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminContactMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["adminContactMessages", page],
    queryFn: () => adminApi.getContactMessages(page, 20),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => adminApi.markContactMessageRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContactMessages"] });
      toast({ title: "Updated", description: "Marked as read" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContactMessages"] });
      toast({ title: "Deleted", description: "Message removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      adminApi.replyToContactMessage(id, reply),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["adminContactMessages"] });
      setReplyDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      if (updated.replyEmailDelivered === false) {
        toast({
          title: "Reply saved",
          description:
            "The reply is stored, but no email was sent. Set MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD on the server (e.g. Gmail SMTP + app password) to email visitors automatically.",
        });
      } else {
        toast({
          title: "Reply sent",
          description: "Your answer was saved and emailed to the visitor.",
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading messages…</p>
        </div>
      </div>
    );
  }

  const unread =
    data?.content?.filter((m: ContactMessage) => !m.readByAdmin && !m.repliedAt).length ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Contact messages</h1>
      <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3">
        Write your answer below each message and click <strong>Send reply</strong>. Replies are saved here and, when
        SMTP is configured on the server, sent to the visitor by email (same account as{" "}
        <code className="text-xs bg-background px-1 rounded">MAIL_USERNAME</code>).
      </p>
      <p className="text-sm text-muted-foreground">
        {data?.totalElements ?? 0} messages
        {unread > 0 ? ` · ${unread} unread` : ""}
      </p>

      <div className="space-y-4">
        {data?.content && data.content.length > 0 ? (
          data.content.map((m) => {
            const answered = Boolean(m.repliedAt);
            const draft = replyDrafts[m.id] ?? "";
            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl bg-card shadow-card border ${
                  answered ? "border-border" : "border-primary/30 ring-1 ring-primary/10"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{m.name}</p>
                      <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline break-all">
                        {m.email}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {answered && (
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-primary/10 text-primary">
                        Answered
                      </span>
                    )}
                    {!answered && !m.readByAdmin && (
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-secondary/15 text-secondary">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium mt-3">{m.subject}</p>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{m.message}</p>

                {answered && m.adminReply && (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Your reply</p>
                    <p className="text-sm whitespace-pre-wrap">{m.adminReply}</p>
                    {m.repliedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Sent {new Date(m.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {!answered && (
                  <div className="mt-4 space-y-2">
                    <label htmlFor={`reply-${m.id}`} className="text-sm font-medium">
                      Your reply
                    </label>
                    <Textarea
                      id={`reply-${m.id}`}
                      placeholder="Type your answer to the visitor…"
                      className="min-h-[120px]"
                      value={draft}
                      onChange={(e) => setReplyDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                      disabled={replyMutation.isPending}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const text = draft.trim();
                          if (!text) {
                            toast({
                              title: "Empty reply",
                              description: "Write a message before sending.",
                              variant: "destructive",
                            });
                            return;
                          }
                          replyMutation.mutate({ id: m.id, reply: text });
                        }}
                        disabled={replyMutation.isPending}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send reply
                      </Button>
                      {!m.readByAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markReadMutation.mutate(m.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read only
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm("Delete this message?")) deleteMutation.mutate(m.id);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-12">No messages yet</div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page + 1} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
