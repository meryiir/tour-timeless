import { useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type Review } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['adminReviews', page],
    queryFn: () => adminApi.getReviews(page, 20),
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) => adminApi.approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['homeRecentReviews'] });
      toast({ title: "Success", description: "Review approved" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => adminApi.rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['homeRecentReviews'] });
      toast({ title: "Success", description: "Review rejected" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReviews'] });
      queryClient.invalidateQueries({ queryKey: ['homeRecentReviews'] });
      toast({ title: "Success", description: "Review deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const pendingCount = data?.content?.filter((r) => !r.approved).length || 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {data?.totalElements || 0} reviews · {pendingCount} pending
      </p>

      <div className="space-y-4">
        {data?.content && data.content.length > 0 ? (
          data.content.map((r) => (
            <div key={r.id} className="p-5 rounded-xl bg-card shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {r.user?.firstName?.[0]}{r.user?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{r.user?.firstName} {r.user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    r.approved ? "bg-primary/10 text-primary" :
                    "bg-secondary/10 text-secondary"
                  }`}>
                    {r.approved ? "approved" : "pending"}
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-secondary text-secondary" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium mt-2">{r.activity?.title}</p>
              <p className="text-sm text-muted-foreground mt-3">{r.comment || 'No comment'}</p>
              <div className="flex gap-2 mt-4">
                {!r.approved && (
                  <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(r.id)}>
                    <Check className="h-3 w-3 mr-1" />Approve
                  </Button>
                )}
                {r.approved && (
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(r.id)}>
                    <X className="h-3 w-3 mr-1" />Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this review?')) {
                      deleteMutation.mutate(r.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />Delete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">No reviews found</div>
        )}
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
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
