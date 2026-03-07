import { useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reviews as mockReviews } from "@/data/mockData";
import type { Review } from "@/data/mockData";

export default function AdminReviews() {
  const [items, setItems] = useState(mockReviews);

  const updateStatus = (id: string, status: Review["status"]) => {
    setItems(items.map((r) => r.id === id ? { ...r, status } : r));
  };

  const deleteReview = (id: string) => {
    setItems(items.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{items.length} reviews · {items.filter((r) => r.status === "pending").length} pending</p>

      <div className="space-y-4">
        {items.map((r) => (
          <div key={r.id} className="p-5 rounded-xl bg-card shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{r.avatar}</div>
                <div>
                  <p className="font-semibold text-sm">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  r.status === "approved" ? "bg-primary/10 text-primary" :
                  r.status === "pending" ? "bg-secondary/10 text-secondary" :
                  "bg-destructive/10 text-destructive"
                }`}>{r.status}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{r.comment}</p>
            <div className="flex gap-2 mt-4">
              {r.status !== "approved" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "approved")}>
                  <Check className="h-3 w-3 mr-1" />Approve
                </Button>
              )}
              {r.status !== "rejected" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, "rejected")}>
                  <X className="h-3 w-3 mr-1" />Reject
                </Button>
              )}
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteReview(r.id)}>
                <Trash2 className="h-3 w-3 mr-1" />Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
