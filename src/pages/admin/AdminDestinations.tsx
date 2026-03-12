import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminDestinations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminDestinations'],
    queryFn: () => adminApi.getDestinations(0, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      toast({ title: "Success", description: "Destination deleted" });
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
          <p className="mt-4 text-muted-foreground">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{data?.content?.length || 0} destinations</p>
        <Button onClick={() => navigate('/admin/destinations/new')}>
          <Plus className="h-4 w-4 mr-2" />Add Destination
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.content && data.content.length > 0 ? (
          data.content.map((d) => (
            <div key={d.id} className="rounded-xl bg-card shadow-card overflow-hidden">
              <img src={d.imageUrl || '/placeholder.svg'} alt={d.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-4">
                <h3 className="font-display font-semibold mb-1">{d.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{d.city}, {d.country}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/destinations/${d.id}/edit`)}
                  >
                    <Edit className="h-3 w-3 mr-1" />Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${d.name}?`)) {
                        deleteMutation.mutate(d.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-8">No destinations found</div>
        )}
      </div>
    </div>
  );
}
