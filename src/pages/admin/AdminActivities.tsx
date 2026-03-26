import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type Activity } from "@/lib/adminApi";
import { getImageUrl } from "@/lib/publicApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminActivities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [page, setPage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminActivities', page],
    queryFn: () => adminApi.getActivities(page, 20),
  });


  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      adminApi.updateActivityStatus(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: "Success", description: "Activity status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: "Success", description: "Activity deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (activity: Activity) => {
    navigate(`/admin/activities/${activity.id}/edit`);
  };

  const handleView = (activity: Activity) => {
    setViewingActivity(activity);
  };

  const filtered = data?.content?.filter((a) => 
    a.title?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activities..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => navigate('/admin/activities/new')}>
          <Plus className="h-4 w-4 mr-2" />Add Activity
        </Button>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingActivity} onOpenChange={(open) => !open && setViewingActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{viewingActivity?.title}</DialogTitle>
            <DialogDescription>Activity Details</DialogDescription>
          </DialogHeader>
          {viewingActivity && (
            <div className="space-y-4">
              <div>
                <img 
                  src={getImageUrl(viewingActivity.imageUrl)} 
                  alt={viewingActivity.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p>{viewingActivity.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Destination</p>
                  <p>{viewingActivity.destination?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p>${viewingActivity.price?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p>{viewingActivity.duration || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                  <p>{viewingActivity.difficultyLevel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>{viewingActivity.active ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              {viewingActivity.shortDescription && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Short Description</p>
                  <p>{viewingActivity.shortDescription}</p>
                </div>
              )}
              {viewingActivity.fullDescription && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Description</p>
                  <p>{viewingActivity.fullDescription}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="rounded-xl bg-card shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Destination</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <img 
                          src={getImageUrl(a.imageUrl)} 
                          alt={a.title}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      <span className="font-medium">{a.title}</span>
                    </div>
                  </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{a.category || 'N/A'}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{a.destination?.name || 'N/A'}</td>
                    <td className="p-4 font-medium">${a.price?.toFixed(2) || '0.00'}</td>
                  <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${a.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {a.active ? "active" : "inactive"}
                      </span>
                  </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleView(a)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(a)}
                          title="Edit activity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive" 
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${a.title}?`)) {
                              deleteMutation.mutate(a.id);
                            }
                          }}
                          title="Delete activity"
                        >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No activities found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
