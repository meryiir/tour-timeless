import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ArrowLeft, Upload, X, Calendar as CalendarIcon, Globe, 
  DollarSign, Clock, MapPin, Image as ImageIcon, FileText,
  Route, Package, Info, AlertCircle, CheckCircle2, HelpCircle, Users,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { adminApi, type Activity } from "@/lib/adminApi";
import { getImageUrl } from "@/lib/publicApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

interface SortableImageItemProps {
  sortableId: string;
  url: string;
  index: number;
  isCover: boolean;
  onRemove: () => void;
  getImageUrl: (url: string) => string;
}

function SortableImageItem({ sortableId, url, index, isCover, onRemove, getImageUrl }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes}
        {...listeners}
        className={cn(
          "relative aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing",
          isCover ? "border-primary ring-2 ring-primary/20" : "border-border",
          isDragging && "ring-2 ring-primary"
        )}
      >
        <img
          src={getImageUrl(url)}
          alt={`Upload ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {isCover && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded z-10 pointer-events-none">
            Cover
          </div>
        )}
        {/* Drag handle indicator */}
        <div
          className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg pointer-events-none"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {/* Remove button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:bg-destructive/90 transition-colors"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Position indicator */}
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg pointer-events-none">
          Position {index + 1}
        </div>
      </div>
    </div>
  );
}

interface TranslationData {
  languageCode: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  location: string;
  category: string;
  departureLocation: string;
  returnLocation: string;
  meetingTime: string;
  availability: string;
  whatToExpect: string;
}

interface GalleryImageEntry {
  id: string;
  url: string;
}

/** Cover first, then gallery; skip duplicates (fixes drag-and-drop / React keys). */
function mergeActivityImageUrls(imageUrl?: string, galleryImages?: string[]): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();
  const push = (u: string | undefined) => {
    if (!u || seen.has(u)) return;
    seen.add(u);
    ordered.push(u);
  };
  push(imageUrl);
  (galleryImages ?? []).forEach(push);
  return ordered;
}

function urlsToGalleryEntries(urls: string[]): GalleryImageEntry[] {
  return urls.map((url, index) => ({
    id: `img-${index}-${url.slice(-80)}`,
    url,
  }));
}

interface ActivityFormData {
  title: string;
  category: string;
  destinationId: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  premiumPrice: string;
  budgetPrice: string;
  duration: string;
  difficultyLevel: string;
  tourType: string;
  itinerary: string;
  availableDates: string;
  departureLocation: string;
  returnLocation: string;
  meetingTime: string;
  availability: string;
  whatToExpect: string;
  complementaries: string;
  mapUrl: string;
  translations: Record<string, TranslationData>;
}

export default function ActivityFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEditing = !!id;
  const [imageEntries, setImageEntries] = useState<GalleryImageEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [activeLanguage, setActiveLanguage] = useState('en');
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({
    en: { languageCode: 'en', title: '', shortDescription: '', fullDescription: '', location: '', category: '', departureLocation: '', returnLocation: '', meetingTime: '', availability: '', whatToExpect: '' },
    fr: { languageCode: 'fr', title: '', shortDescription: '', fullDescription: '', location: '', category: '', departureLocation: '', returnLocation: '', meetingTime: '', availability: '', whatToExpect: '' },
    es: { languageCode: 'es', title: '', shortDescription: '', fullDescription: '', location: '', category: '', departureLocation: '', returnLocation: '', meetingTime: '', availability: '', whatToExpect: '' },
    de: { languageCode: 'de', title: '', shortDescription: '', fullDescription: '', location: '', category: '', departureLocation: '', returnLocation: '', meetingTime: '', availability: '', whatToExpect: '' },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ActivityFormData>({
    defaultValues: {
      title: '',
      category: '',
      destinationId: '',
      shortDescription: '',
      fullDescription: '',
      price: '',
      premiumPrice: '',
      budgetPrice: '',
      duration: '',
      difficultyLevel: '',
      tourType: 'SHARED',
      itinerary: '',
      availableDates: '',
      departureLocation: '',
      returnLocation: '',
      meetingTime: '',
      availability: '',
      whatToExpect: '',
      complementaries: '',
      mapUrl: '',
      translations: {},
    }
  });

  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => {
      // Check user role before making request
      if (user?.role !== 'ROLE_ADMIN') {
        throw new Error('Access denied. You must be an administrator to edit activities. Please log in with an admin account.');
      }
      return adminApi.getActivityById(Number(id));
    },
    enabled: isEditing && user?.role === 'ROLE_ADMIN',
    retry: 1,
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to load activity", 
        variant: "destructive" 
      });
    },
  });

  const { data: destinationsData, isLoading: destinationsLoading, error: destinationsError } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => adminApi.getDestinations(0, 500),
    retry: 1,
  });

  /** Ensure the activity's destination appears in the dropdown (pagination / edge cases). */
  const destinationChoices = useMemo(() => {
    const rows = [...(destinationsData?.content ?? [])];
    const cur = activityData?.destination;
    const fid = activityData?.destinationId ?? cur?.id;
    if (fid != null && !rows.some((d) => d.id === fid)) {
      if (cur) {
        rows.unshift(cur);
      } else {
        rows.unshift({
          id: fid,
          name: `Destination #${fid}`,
          slug: "",
        });
      }
    }
    return rows;
  }, [destinationsData?.content, activityData?.destination, activityData?.destinationId]);

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi.getCategories(),
    retry: 1,
  });

  useEffect(() => {
    if (activityData && isEditing) {
      // Set English (default) values
      setValue('title', activityData.title || '');
      setValue('category', activityData.category || '');
      const destIdStr =
        activityData.destination?.id != null
          ? String(activityData.destination.id)
          : activityData.destinationId != null
            ? String(activityData.destinationId)
            : "";
      setValue("destinationId", destIdStr);
      setValue('shortDescription', activityData.shortDescription || '');
      setValue('fullDescription', activityData.fullDescription || '');
      setValue('price', activityData.price?.toString() || '');
      setValue('premiumPrice', activityData.premiumPrice?.toString() || '');
      setValue('budgetPrice', activityData.budgetPrice?.toString() || '');
      setValue('duration', activityData.duration || '');
      setValue('difficultyLevel', activityData.difficultyLevel?.toLowerCase().replace('_', ' ') || '');
      setValue('tourType', activityData.tourType || 'SHARED');
      setValue('itinerary', activityData.itinerary?.join('\n') || '');
      setValue('availableDates', activityData.availableDates?.join(', ') || '');
      setValue('departureLocation', activityData.departureLocation || '');
      setValue('returnLocation', activityData.returnLocation || '');
      setValue('meetingTime', activityData.meetingTime || '');
      setValue('availability', activityData.availability || '');
      setValue('whatToExpect', activityData.whatToExpect || '');
      setValue('complementaries', activityData.complementaries?.join('\n') || '');
      setValue('mapUrl', activityData.mapUrl || '');
      
      // Set English translation (default values)
      setTranslations(prev => ({
        ...prev,
        en: {
          languageCode: 'en',
          title: activityData.title || '',
          shortDescription: activityData.shortDescription || '',
          fullDescription: activityData.fullDescription || '',
          location: activityData.location || '',
          category: activityData.category || '',
          departureLocation: activityData.departureLocation || '',
          returnLocation: activityData.returnLocation || '',
          meetingTime: activityData.meetingTime || '',
          availability: activityData.availability || '',
          whatToExpect: activityData.whatToExpect || '',
        }
      }));
      
      setImageEntries(
        urlsToGalleryEntries(
          mergeActivityImageUrls(activityData.imageUrl, activityData.galleryImages)
        )
      );
      if (activityData.availableDates) {
        setSelectedDates(activityData.availableDates.map(date => new Date(date)));
      }
    }
  }, [activityData, isEditing, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: t('common.success'), description: t('admin.activities.activityCreated') });
      navigate('/admin/activities');
    },
    onError: (error: Error) => {
      toast({ title: t('common.error'), description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: t('common.success'), description: t('admin.activities.activityUpdated') });
      navigate('/admin/activities');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadFile(file),
    onSuccess: (result) => {
      setImageEntries((prev) => [...prev, { id: `up-${crypto.randomUUID()}`, url: result.url }]);
      toast({ 
        title: "Success", 
        description: "Image uploaded successfully",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Failed to upload image. Please check your permissions and try again.",
        variant: "destructive" 
      });
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Check authentication and admin role
    if (!isAuthenticated) {
      toast({ 
        title: "Authentication Required", 
        description: "Please log in to upload images", 
        variant: "destructive" 
      });
      return;
    }

    if (user?.role !== 'ROLE_ADMIN' && user?.role !== 'ADMIN') {
      toast({ 
        title: "Permission Denied", 
        description: "Only administrators can upload images. Please contact an administrator.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length === 0) {
        toast({ 
          title: "Invalid file type", 
          description: "Please select image files only (JPG, PNG, GIF, WEBP)", 
          variant: "destructive" 
        });
        setIsUploading(false);
        return;
      }

      for (const file of imageFiles) {
        if (file.size > 10 * 1024 * 1024) {
          toast({ 
            title: "File too large", 
            description: `${file.name} exceeds 10MB limit`, 
            variant: "destructive" 
          });
          continue;
        }
        
        try {
          await uploadMutation.mutateAsync(file);
        } catch (error) {
          console.error('Upload error:', error);
          // Error toast is already shown by the mutation's onError handler
        }
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

  const removeImage = (index: number) => {
    setImageEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImageEntries((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const onSubmit = (data: ActivityFormData) => {
    let destId = parseInt((data.destinationId || "").trim(), 10);
    if (!Number.isFinite(destId) && isEditing && activityData) {
      const fb = activityData.destination?.id ?? activityData.destinationId;
      if (fb != null) destId = Number(fb);
    }
    if (!Number.isFinite(destId)) {
      toast({
        title: t('common.error'),
        description: t('admin.activities.selectDestination'),
        variant: 'destructive',
      });
      return;
    }

    const parsedDates: string[] = selectedDates.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    const difficultyMap: Record<string, string> = {
      'easy': 'EASY',
      'moderate': 'MODERATE',
      'challenging': 'HARD',
      'expert': 'EXTREME'
    };
    
    const difficultyLevel = data.difficultyLevel 
      ? difficultyMap[data.difficultyLevel.toLowerCase()] || null 
      : null;

    const parseOptionalTierPrice = (raw: string): number | null => {
      const s = raw?.trim();
      if (!s) return null;
      const n = parseFloat(s);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    };

    const payload: any = {
      title: data.title.trim(),
      category: data.category,
      destinationId: destId,
      shortDescription: data.shortDescription || null,
      fullDescription: data.fullDescription || null,
      price: parseFloat(data.price),
      premiumPrice: parseOptionalTierPrice(data.premiumPrice),
      budgetPrice: parseOptionalTierPrice(data.budgetPrice),
      duration: data.duration || null,
      difficultyLevel: difficultyLevel,
      tourType: data.tourType || 'SHARED',
      imageUrl: imageEntries[0]?.url ?? null,
      galleryImages: imageEntries.slice(1).map((e) => e.url),
      itinerary: data.itinerary ? data.itinerary.split('\n').filter(line => line.trim()) : [],
      departureLocation: data.departureLocation || null,
      returnLocation: data.returnLocation || null,
      meetingTime: data.meetingTime || null,
      availability: data.availability || null,
      whatToExpect: data.whatToExpect || null,
      complementaries: data.complementaries ? data.complementaries.split('\n').filter(line => line.trim()) : [],
      mapUrl: data.mapUrl || null,
      active: isEditing ? (activityData?.active ?? true) : true,
      featured: isEditing ? (activityData?.featured ?? false) : false,
      // Backend requires a non-blank title per ActivityTranslationRequest; only send complete rows.
      translations: Object.values(translations).filter(
        (tr) => (tr.title?.trim()?.length ?? 0) > 0
      ),
    };

    if (parsedDates.length > 0) {
      payload.availableDates = parsedDates;
    }

    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = (activityLoading && isEditing) || (destinationsLoading && !destinationsData) || (categoriesLoading && !categoriesData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (activityError && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Failed to Load Activity</h2>
            <p className="text-muted-foreground mb-4">
              {activityError instanceof Error ? activityError.message : "An error occurred while loading the activity."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/admin/activities')}>
                Back to Activities
              </Button>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['activity', id] })}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const FieldHelper = ({ text }: { text: string }) => (
    <div className="flex items-start gap-1.5 mt-1.5">
      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/activities')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">
            {isEditing ? t('admin.activities.editActivity') : t('admin.activities.createNew')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing ? t('admin.activities.updateDetails') : t('admin.activities.fillForm')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle>{t('admin.activities.basicInformation')}</CardTitle>
            </div>
            <CardDescription>
              {t('admin.activities.essentialDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destination */}
              <div className="space-y-2">
                <Label htmlFor="destinationId" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('admin.activities.destination')} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("destinationId") || undefined}
                  onValueChange={(value) => setValue("destinationId", value)}
                >
                  <SelectTrigger id="destinationId">
                    <SelectValue placeholder={t('admin.activities.selectDestination')} />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationChoices.length > 0 ? (
                      destinationChoices.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>{t('admin.activities.loadingDestinations')}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FieldHelper text={t('admin.activities.chooseLocation')} />
                {errors.destinationId && (
                  <p className="text-sm text-destructive mt-1">{errors.destinationId.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('admin.activities.category')} <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="category"
                  placeholder={t('admin.activities.categoryPlaceholder')}
                  value={watch('category')}
                  onChange={(e) => setValue('category', e.target.value)}
                  className={errors.category ? "border-destructive" : ""}
                />
                <FieldHelper text={t('admin.activities.typeOfActivity')} />
                {errors.category && (
                  <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Standard Price per Person <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="price"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })} 
                  className={errors.price ? "border-destructive" : ""}
                />
                <FieldHelper text="Enter standard price in USD (e.g., 99.99)" />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Premium Price */}
              <div className="space-y-2">
                <Label htmlFor="premiumPrice" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Premium Price per Person
                </Label>
                <Input 
                  id="premiumPrice"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register('premiumPrice', { 
                    min: { value: 0, message: 'Price must be positive' }
                  })} 
                  className={errors.premiumPrice ? "border-destructive" : ""}
                />
                <FieldHelper text="Enter premium price for luxury tours (optional)" />
                {errors.premiumPrice && (
                  <p className="text-sm text-destructive mt-1">{errors.premiumPrice.message}</p>
                )}
              </div>

              {/* Budget Price */}
              <div className="space-y-2">
                <Label htmlFor="budgetPrice" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget-Friendly Price per Person
                </Label>
                <Input 
                  id="budgetPrice"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  {...register('budgetPrice', { 
                    min: { value: 0, message: 'Price must be positive' }
                  })} 
                  className={errors.budgetPrice ? "border-destructive" : ""}
                />
                <FieldHelper text="Enter budget-friendly price (optional)" />
                {errors.budgetPrice && (
                  <p className="text-sm text-destructive mt-1">{errors.budgetPrice.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration
                </Label>
                <Input 
                  id="duration"
                  placeholder="e.g., 3 hours, 2 days"
                  {...register('duration')}
                />
                <FieldHelper text="How long the activity lasts (e.g., '3 hours', 'Full day')" />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficultyLevel" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Difficulty Level
                </Label>
                <Select 
                  value={watch('difficultyLevel')} 
                  onValueChange={(value) => setValue('difficultyLevel', value)}
                >
                  <SelectTrigger id="difficultyLevel">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Easy", "Moderate", "Challenging", "Expert"].map((d) => (
                      <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHelper text="Physical difficulty level of the activity" />
              </div>

              {/* Tour Type */}
              <div className="space-y-2">
                <Label htmlFor="tourType" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t('admin.activities.tourType')} <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={watch('tourType')} 
                  onValueChange={(value) => setValue('tourType', value)}
                >
                  <SelectTrigger id="tourType">
                    <SelectValue placeholder={t('admin.activities.selectTourType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHARED">{t('admin.activities.sharedTour')}</SelectItem>
                    <SelectItem value="PRIVATE">{t('admin.activities.privateTour')}</SelectItem>
                  </SelectContent>
                </Select>
                <FieldHelper text={t('admin.activities.tourTypeHelper')} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Content & Descriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Content & Descriptions</CardTitle>
            </div>
            <CardDescription>
              Provide detailed information about your activity. You can add translations in multiple languages using the tabs below.
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
                <TabsContent key={lang.code} value={lang.code} className="space-y-5 mt-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor={`title-${lang.code}`} className="flex items-center gap-2">
                      Activity Title {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                      {lang.code === 'en' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input 
                      id={`title-${lang.code}`}
                      placeholder={`e.g., "Sunset Cruise Tour"`}
                      value={lang.code === 'en' ? watch('title') : translations[lang.code]?.title || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setValue('title', e.target.value);
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], title: e.target.value }
                          }));
                        }
                      }}
                      className={lang.code === 'en' && errors.title ? "border-destructive" : ""}
                    />
                    <FieldHelper text="A catchy title that describes your activity (50-100 characters recommended)" />
                    {lang.code === 'en' && errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`shortDescription-${lang.code}`}>
                      Short Description {lang.code === 'en' && <span className="text-destructive">*</span>}
                    </Label>
                    <Textarea 
                      id={`shortDescription-${lang.code}`}
                      placeholder="A brief summary (1-2 sentences) that appears in activity listings"
                      className="min-h-[80px]"
                      value={lang.code === 'en' ? watch('shortDescription') : translations[lang.code]?.shortDescription || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setValue('shortDescription', e.target.value);
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], shortDescription: e.target.value }
                          }));
                        }
                      }}
                    />
                    <FieldHelper text="Brief overview shown in search results and cards (100-200 characters)" />
                  </div>

                  {/* Full Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`fullDescription-${lang.code}`}>
                      Full Description
                    </Label>
                    <Textarea 
                      id={`fullDescription-${lang.code}`}
                      placeholder="Detailed information about the activity, what makes it special, highlights, etc."
                      className="min-h-[150px]"
                      value={lang.code === 'en' ? watch('fullDescription') : translations[lang.code]?.fullDescription || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setValue('fullDescription', e.target.value);
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], fullDescription: e.target.value }
                          }));
                        }
                      }}
                    />
                    <FieldHelper text="Complete description with all details, highlights, and what visitors can expect" />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor={`location-${lang.code}`} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input 
                      id={`location-${lang.code}`}
                      placeholder="e.g., Central Park, New York"
                      value={lang.code === 'en' ? watch('location') || '' : translations[lang.code]?.location || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setValue('location', e.target.value);
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], location: e.target.value }
                          }));
                        }
                      }}
                    />
                    <FieldHelper text="Specific location or meeting point for the activity" />
                  </div>

                  {/* What to Expect */}
                  <div className="space-y-2">
                    <Label htmlFor={`whatToExpect-${lang.code}`}>
                      What to Expect
                    </Label>
                    <Textarea 
                      id={`whatToExpect-${lang.code}`}
                      placeholder="Describe what participants will experience during this activity"
                      className="min-h-[100px]"
                      value={lang.code === 'en' ? watch('whatToExpect') || '' : translations[lang.code]?.whatToExpect || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setValue('whatToExpect', e.target.value);
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], whatToExpect: e.target.value }
                          }));
                        }
                      }}
                    />
                    <FieldHelper text="Help visitors understand what they'll experience (sights, activities, highlights)" />
                  </div>

                  <Separator />

                  {/* Departure & Return Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`departureLocation-${lang.code}`}>
                        Departure Location
                      </Label>
                      <Input 
                        id={`departureLocation-${lang.code}`}
                        placeholder="Where the activity starts"
                        value={lang.code === 'en' ? watch('departureLocation') || '' : translations[lang.code]?.departureLocation || ''}
                        onChange={(e) => {
                          if (lang.code === 'en') {
                            setValue('departureLocation', e.target.value);
                          } else {
                            setTranslations(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], departureLocation: e.target.value }
                            }));
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`returnLocation-${lang.code}`}>
                        Return Location
                      </Label>
                      <Input 
                        id={`returnLocation-${lang.code}`}
                        placeholder="Where the activity ends"
                        value={lang.code === 'en' ? watch('returnLocation') || '' : translations[lang.code]?.returnLocation || ''}
                        onChange={(e) => {
                          if (lang.code === 'en') {
                            setValue('returnLocation', e.target.value);
                          } else {
                            setTranslations(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], returnLocation: e.target.value }
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Meeting Time & Availability */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`meetingTime-${lang.code}`} className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Meeting Time
                      </Label>
                      <Input 
                        id={`meetingTime-${lang.code}`}
                        placeholder="e.g., 9:00 AM, Flexible"
                        value={lang.code === 'en' ? watch('meetingTime') || '' : translations[lang.code]?.meetingTime || ''}
                        onChange={(e) => {
                          if (lang.code === 'en') {
                            setValue('meetingTime', e.target.value);
                          } else {
                            setTranslations(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], meetingTime: e.target.value }
                            }));
                          }
                        }}
                      />
                      <FieldHelper text="When participants should arrive (e.g., '9:00 AM' or 'Flexible')" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`availability-${lang.code}`}>
                        Availability
                      </Label>
                      <Input 
                        id={`availability-${lang.code}`}
                        placeholder="e.g., Daily, Weekends only"
                        value={lang.code === 'en' ? watch('availability') || '' : translations[lang.code]?.availability || ''}
                        onChange={(e) => {
                          if (lang.code === 'en') {
                            setValue('availability', e.target.value);
                          } else {
                            setTranslations(prev => ({
                              ...prev,
                              [lang.code]: { ...prev[lang.code], availability: e.target.value }
                            }));
                          }
                        }}
                      />
                      <FieldHelper text="When this activity is available (e.g., 'Daily', 'Weekends only')" />
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Section 3: Images & Media */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <CardTitle>Images & Media</CardTitle>
            </div>
            <CardDescription>
              Upload high-quality images to showcase your activity. The first image will be used as the main cover image. Drag and drop images to reorder them.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "relative p-12 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-accent/50",
                isUploading && "opacity-50 pointer-events-none"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <div className="flex flex-col items-center gap-3">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    <p className="text-sm font-medium">Uploading images...</p>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-base font-semibold mb-1">
                        Drop images here or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports JPG, PNG, GIF, WEBP (max 10MB per file)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
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
            
            {imageEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    Uploaded Images ({imageEntries.length})
                  </Label>
                  {imageEntries.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      First image is the cover photo. Drag images by the grip icon to reorder them.
                    </p>
                  )}
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={imageEntries.map((e) => e.id)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {imageEntries.map((entry, index) => (
                        <SortableImageItem
                          key={entry.id}
                          sortableId={entry.id}
                          url={entry.url}
                          index={index}
                          isCover={index === 0}
                          onRemove={() => removeImage(index)}
                          getImageUrl={getImageUrl}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Schedule & Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle>Schedule & Availability</CardTitle>
            </div>
            <CardDescription>
              Set when this activity is available. You can select multiple dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !selectedDates.length && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDates.length > 0 ? (
                      <span>
                        {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                      </span>
                    ) : (
                      <span>Click to select available dates</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => {
                      if (dates) {
                        setSelectedDates(dates);
                      }
                    }}
                    initialFocus
                  />
                  {selectedDates.length > 0 && (
                    <div className="p-4 border-t">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                          >
                            <span>{format(date, "MMM dd, yyyy")}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDates(selectedDates.filter((_, i) => i !== index));
                              }}
                              className="ml-1 hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSelectedDates([]);
                        }}
                      >
                        Clear all dates
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <FieldHelper text="Select all dates when this activity is available. Leave empty if available all year." />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Additional Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              <CardTitle>Additional Details</CardTitle>
            </div>
            <CardDescription>
              Provide itinerary, what's included, and other helpful information for visitors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Itinerary */}
            <div className="space-y-2">
              <Label htmlFor="itinerary">
                Itinerary / Activity Schedule
              </Label>
              <Textarea 
                id="itinerary"
                placeholder="Enter each step or time slot on a new line:&#10;9:00 AM - Hotel pickup&#10;10:00 AM - Arrive at location&#10;12:00 PM - Lunch break"
                className="min-h-[120px] font-mono text-sm"
                {...register('itinerary')}
              />
              <FieldHelper text="List each step or time slot on a separate line. Visitors will see this as a step-by-step guide." />
            </div>

            {/* Complementaries / What's Included */}
            <div className="space-y-2">
              <Label htmlFor="complementaries">
                What's Included / Complementaries
              </Label>
              <Textarea 
                id="complementaries"
                placeholder="Enter each item on a new line:&#10;Professional guide&#10;Transportation&#10;Lunch included&#10;Equipment provided"
                className="min-h-[100px] font-mono text-sm"
                {...register('complementaries')}
              />
              <FieldHelper text="List everything included in the activity price, one item per line (e.g., guide, meals, equipment)" />
            </div>

            {/* Map URL */}
            <div className="space-y-2">
              <Label htmlFor="mapUrl" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map URL (Optional)
              </Label>
              <Input 
                id="mapUrl"
                type="url"
                placeholder="https://www.google.com/maps/embed?pb=..."
                {...register('mapUrl')}
              />
              <FieldHelper text="Embed URL from Google Maps or other mapping services to show location on the activity page" />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Ready to {isEditing ? 'update' : 'create'} this activity?</p>
                <p className="text-xs text-muted-foreground">
                  {isEditing 
                    ? 'Review your changes and click "Update Activity" to save' 
                    : 'Review all information and click "Create Activity" to publish'}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => navigate('/admin/activities')}
                  className="flex-1 sm:flex-initial"
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 sm:flex-initial"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t('admin.activities.saving')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isEditing ? t('admin.activities.updateActivity') : t('admin.activities.createActivity')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
