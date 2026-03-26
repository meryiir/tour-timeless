import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, FileText, Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { getImageUrl, publicApi } from "@/lib/publicApi";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const moroccanCities = [
  'Casablanca',
  'Marrakech',
  'Rabat',
  'Fez',
  'Tangier',
  'Agadir',
  'Meknes',
  'Oujda',
  'Tetouan',
  'Safi',
  'Kenitra',
  'Nador',
  'Settat',
  'Larache',
  'Khouribga',
  'Beni Mellal',
  'Taza',
  'El Jadida',
  'Tiznit',
  'Errachidia',
  'Sahara Desert',
  'Merzouga',
];

interface TranslationData {
  languageCode: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
}

export default function DestinationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEditing = !!id;
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name: "",
    country: "Morocco",
    city: "",
    shortDescription: "",
    fullDescription: "",
    featured: false,
  });
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({
    en: { languageCode: 'en', name: '', shortDescription: '', fullDescription: '' },
    fr: { languageCode: 'fr', name: '', shortDescription: '', fullDescription: '' },
    es: { languageCode: 'es', name: '', shortDescription: '', fullDescription: '' },
    de: { languageCode: 'de', name: '', shortDescription: '', fullDescription: '' },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminDetail, isLoading: destinationLoading } = useQuery({
    queryKey: ['admin-destination-detail', id],
    queryFn: () => adminApi.getDestinationForAdmin(Number(id)),
    enabled: isEditing && !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: destinationActivitiesData, isLoading: destinationActivitiesLoading } = useQuery({
    queryKey: ['admin-destination-activities', id, i18n.language],
    queryFn: () =>
      publicApi.filterActivities({
        destinationId: Number(id),
        page: 0,
        size: 200,
        lang: i18n.language,
      }),
    enabled: isEditing && !!id,
  });

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    if (!id) return;

    if (!adminDetail) {
      return;
    }

    if (Number(adminDetail.id) !== Number(id)) {
      return;
    }

    setFormData({
        name: adminDetail.name || "",
        country: "Morocco",
        city: adminDetail.city || "",
        shortDescription: adminDetail.shortDescription || "",
        fullDescription: adminDetail.fullDescription || "",
        featured: adminDetail.featured || false,
      });
      setUploadedImage(adminDetail.imageUrl || null);

      const loadedTranslations: Record<string, TranslationData> = {
        en: { languageCode: 'en', name: '', shortDescription: '', fullDescription: '' },
        fr: { languageCode: 'fr', name: '', shortDescription: '', fullDescription: '' },
        es: { languageCode: 'es', name: '', shortDescription: '', fullDescription: '' },
        de: { languageCode: 'de', name: '', shortDescription: '', fullDescription: '' },
      };

      loadedTranslations.en = {
        languageCode: 'en',
        name: adminDetail.name || '',
        shortDescription: adminDetail.shortDescription || '',
        fullDescription: adminDetail.fullDescription || '',
      };

      for (const dt of adminDetail.destinationTranslations ?? []) {
        if (loadedTranslations[dt.languageCode]) {
          loadedTranslations[dt.languageCode] = {
            languageCode: dt.languageCode,
            name: dt.name ?? '',
            shortDescription: dt.shortDescription ?? '',
            fullDescription: dt.fullDescription ?? '',
          };
        }
      }

      setTranslations(loadedTranslations);
  }, [adminDetail, isEditing, id]);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadFile(file),
    onSuccess: (result) => {
      setUploadedImage(result.url);
      toast({ title: "Success", description: "Image uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createDestination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      toast({ title: t('common.success'), description: t('admin.destinations.destinationCreated') });
      navigate('/admin/destinations');
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateDestination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      toast({ title: t('common.success'), description: t('admin.destinations.destinationUpdated') });
      navigate('/admin/destinations');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const file = files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Invalid file type", 
          description: "Please select an image file (JPG, PNG, GIF, WEBP)", 
          variant: "destructive" 
        });
        setIsUploading(false);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: `${file.name} exceeds 10MB limit`, 
          variant: "destructive" 
        });
        setIsUploading(false);
        return;
      }
      
      try {
        await uploadMutation.mutateAsync(file);
      } catch (error) {
        console.error('Upload error:', error);
      }
    } catch (error) {
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in required fields (Name)", 
        variant: "destructive" 
      });
      return;
    }

    // Prepare translations array (exclude English as it's in main form)
    const translationArray = Object.entries(translations)
      .filter(([code]) => code !== 'en')
      .filter(([, data]) => data.name || data.shortDescription || data.fullDescription)
      .map(([code, data]) => ({
        languageCode: code,
        name: data.name || '',
        shortDescription: data.shortDescription || '',
        fullDescription: data.fullDescription || '',
      }));

    const destinationData: Record<string, unknown> = {
      name: formData.name,
      country: "Morocco",
      city: formData.city || null,
      shortDescription: formData.shortDescription || null,
      fullDescription: formData.fullDescription || null,
      imageUrl: uploadedImage || null,
      featured: formData.featured,
      translations: translationArray,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: destinationData });
    } else {
      createMutation.mutate(destinationData);
    }
  };

  if (destinationLoading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading destination...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/destinations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">
            {isEditing ? t('admin.destinations.editDestination') : t('admin.destinations.addNew')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? t('admin.destinations.updateDetails') : t('admin.destinations.createNew')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.destinations.basicInformation')}</CardTitle>
            <CardDescription>{t('admin.destinations.essentialDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin.destinations.destinationName')} <span className="text-destructive">*</span></Label>
              <Input 
                id="name"
                placeholder={t('admin.destinations.destinationNamePlaceholder')} 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">{t('admin.destinations.country')} <span className="text-destructive">*</span></Label>
                <Input 
                  id="country"
                  value="Morocco"
                  readOnly
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('admin.destinations.city')}</Label>
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={t('admin.destinations.city')} />
                  </SelectTrigger>
                  <SelectContent>
                    {moroccanCities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                {t('admin.destinations.featuredDestination')}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Content & Descriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>{t('admin.destinations.contentDescriptions')}</CardTitle>
            </div>
            <CardDescription>
              {t('admin.destinations.provideDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {languages.map((lang) => (
                  <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {languages.map((lang) => (
                <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${lang.code}`}>
                      Destination Name {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                      {lang.code === 'en' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input 
                      id={`name-${lang.code}`}
                      placeholder="e.g., Paris, France"
                      value={lang.code === 'en' ? formData.name : translations[lang.code]?.name || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, name: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], name: e.target.value }
                          }));
                        }
                      }}
                      required={lang.code === 'en'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`shortDescription-${lang.code}`}>
                      Short Description {lang.code === 'en' && <span className="text-destructive">*</span>}
                    </Label>
                    <Textarea 
                      id={`shortDescription-${lang.code}`}
                      placeholder="A brief summary (1-2 sentences) that appears in destination listings"
                      className="min-h-[80px]"
                      value={lang.code === 'en' ? formData.shortDescription : translations[lang.code]?.shortDescription || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, shortDescription: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], shortDescription: e.target.value }
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`fullDescription-${lang.code}`}>
                      Full Description
                    </Label>
                    <Textarea 
                      id={`fullDescription-${lang.code}`}
                      placeholder="Detailed information about the destination, what makes it special, highlights, etc."
                      className="min-h-[150px]"
                      value={lang.code === 'en' ? formData.fullDescription : translations[lang.code]?.fullDescription || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, fullDescription: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], fullDescription: e.target.value }
                          }));
                        }
                      }}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {isEditing && id && (
          <Card>
            <CardHeader>
              <CardTitle>{t("admin.destinations.toursAndActivitiesTitle")}</CardTitle>
              <CardDescription>{t("admin.destinations.toursAndActivitiesHint")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {destinationActivitiesLoading ? (
                <p className="text-sm text-muted-foreground">{t("admin.destinations.toursAndActivitiesLoading")}</p>
              ) : (destinationActivitiesData?.content?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">{t("admin.destinations.toursAndActivitiesEmpty")}</p>
              ) : (
                <ul className="space-y-2">
                  {(destinationActivitiesData?.content ?? []).map((activity) => (
                    <li
                      key={activity.id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <img
                          src={getImageUrl(activity.imageUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{activity.title}</p>
                        {activity.price != null && (
                          <p className="text-xs text-muted-foreground">${activity.price.toFixed(2)}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() => navigate(`/admin/activities/${activity.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-1.5" />
                        {t("admin.destinations.editLinkedActivity")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button type="button" variant="secondary" onClick={() => navigate("/admin/activities/new")}>
                <Plus className="h-4 w-4 mr-2" />
                {t("admin.destinations.toursAndActivitiesAdd")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.destinations.destinationImage')}</CardTitle>
            <CardDescription>{t('admin.destinations.uploadQuality')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`p-8 border-2 border-dashed rounded-xl text-center text-sm cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                {isUploading ? t('admin.destinations.uploading') : t('admin.destinations.dropImage')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('admin.destinations.formats')}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFileSelect(e.target.files);
                if (e.target) {
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
            {uploadedImage && (
              <div className="mt-4 relative group">
                <img
                  src={getImageUrl(uploadedImage)}
                  alt="Uploaded"
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/admin/destinations')}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? t('common.loading') : (isEditing ? t('admin.destinations.updateDestination') : t('admin.destinations.createDestination'))}
          </Button>
        </div>
      </form>
    </div>
  );
}
