import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function AdminDestinations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [destinationToDelete, setDestinationToDelete] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminDestinations'],
    queryFn: () => adminApi.getDestinations(0, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      toast({ title: t('common.success'), description: t('admin.destinations.destinationDeleted') });
      setDeleteDialogOpen(false);
      setDestinationToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteClick = (id: number, name: string) => {
    setDestinationToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (destinationToDelete) {
      deleteMutation.mutate(destinationToDelete.id);
    }
  };


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
        <div>
          <h1 className="text-3xl font-display font-bold">{t('admin.destinations.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin.destinations.manageListings')} ({data?.content?.length || 0} {t('admin.destinations.totalDestinations')})
          </p>
        </div>
        <Button onClick={() => navigate('/admin/destinations/new')}>
          <Plus className="h-4 w-4 mr-2" />{t('admin.destinations.addDestination')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.content && data.content.length > 0 ? (
          data.content.map((d) => (
            <Card key={d.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={d.imageUrl || '/placeholder.svg'} 
                  alt={d.name} 
                  className="w-full aspect-[4/3] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                {d.featured && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">
                  <Link to={`/destinations/${d.slug}`} className="hover:text-primary hover:underline">
                    {d.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {d.city && d.country ? `${d.city}, ${d.country}` : d.country || d.city || t('admin.destinations.locationNotSet')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {d.shortDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {d.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{t('admin.destinations.multilanguageSupport')}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/destinations/${d.id}/edit`)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />{t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(d.id, d.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">{t('admin.destinations.noDestinationsFound')}</p>
              <p className="text-sm text-muted-foreground mb-4">{t('admin.destinations.getStarted')}</p>
              <Button onClick={() => navigate('/admin/destinations/new')}>
                <Plus className="h-4 w-4 mr-2" />{t('admin.destinations.addFirstDestination')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.destinations.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.destinations.deleteConfirm')} "{destinationToDelete?.name}". {t('admin.destinations.deleteConfirmDetails')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('admin.destinations.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
