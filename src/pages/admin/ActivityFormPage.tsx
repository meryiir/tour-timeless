import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { adminApi, type Activity } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActivityFormData {
  title: string;
  category: string;
  destinationId: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  duration: string;
  difficultyLevel: string;
  itinerary: string;
  availableDates: string;
  departureLocation: string;
  returnLocation: string;
  meetingTime: string;
  availability: string;
  whatToExpect: string;
  complementaries: string;
  mapUrl: string;
}

export default function ActivityFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ActivityFormData>({
    defaultValues: {
      title: '',
      category: '',
      destinationId: '',
      shortDescription: '',
      fullDescription: '',
      price: '',
      duration: '',
      difficultyLevel: '',
      itinerary: '',
      availableDates: '',
      departureLocation: '',
      returnLocation: '',
      meetingTime: '',
      availability: '',
      whatToExpect: '',
      complementaries: '',
      mapUrl: '',
    }
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => adminApi.getActivityById(Number(id)),
    enabled: isEditing,
  });

  const { data: destinationsData, isLoading: destinationsLoading, error: destinationsError } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => adminApi.getDestinations(0, 100),
    retry: 1,
  });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminApi.getCategories(),
    retry: 1,
  });

  useEffect(() => {
    if (activityData && isEditing) {
      setValue('title', activityData.title || '');
      setValue('category', activityData.category || '');
      setValue('destinationId', activityData.destination?.id?.toString() || '');
      setValue('shortDescription', activityData.shortDescription || '');
      setValue('fullDescription', activityData.fullDescription || '');
      setValue('price', activityData.price?.toString() || '');
      setValue('duration', activityData.duration || '');
      setValue('difficultyLevel', activityData.difficultyLevel?.toLowerCase().replace('_', ' ') || '');
      setValue('itinerary', activityData.itinerary?.join('\n') || '');
      setValue('availableDates', activityData.availableDates?.join(', ') || '');
      setValue('departureLocation', activityData.departureLocation || '');
      setValue('returnLocation', activityData.returnLocation || '');
      setValue('meetingTime', activityData.meetingTime || '');
      setValue('availability', activityData.availability || '');
      setValue('whatToExpect', activityData.whatToExpect || '');
      setValue('complementaries', activityData.complementaries?.join('\n') || '');
      setValue('mapUrl', activityData.mapUrl || '');
      setUploadedImages(activityData.imageUrl ? [activityData.imageUrl] : []);
      if (activityData.galleryImages) {
        setUploadedImages(prev => [...prev, ...activityData.galleryImages!]);
      }
      if (activityData.availableDates) {
        setSelectedDates(activityData.availableDates.map(date => new Date(date)));
      }
    }
  }, [activityData, isEditing, setValue]);

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: "Success", description: "Activity created successfully" });
      navigate('/admin/activities');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminActivities'] });
      toast({ title: "Success", description: "Activity updated successfully" });
      navigate('/admin/activities');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminApi.uploadFile(file),
    onSuccess: (result) => {
      setUploadedImages(prev => [...prev, result.url]);
      toast({ title: "Success", description: "Image uploaded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
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
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  };

  const onSubmit = (data: ActivityFormData) => {
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

    const activityData: any = {
      title: data.title,
      category: data.category,
      destinationId: parseInt(data.destinationId),
      shortDescription: data.shortDescription || null,
      fullDescription: data.fullDescription || null,
      price: parseFloat(data.price),
      duration: data.duration || null,
      difficultyLevel: difficultyLevel,
      imageUrl: uploadedImages[0] || null,
      galleryImages: uploadedImages.slice(1),
      itinerary: data.itinerary ? data.itinerary.split('\n').filter(line => line.trim()) : [],
      departureLocation: data.departureLocation || null,
      returnLocation: data.returnLocation || null,
      meetingTime: data.meetingTime || null,
      availability: data.availability || null,
      whatToExpect: data.whatToExpect || null,
      complementaries: data.complementaries ? data.complementaries.split('\n').filter(line => line.trim()) : [],
      mapUrl: data.mapUrl || null,
      active: true,
      featured: false,
    };

    if (parsedDates.length > 0) {
      activityData.availableDates = parsedDates;
    }

    if (isEditing && id) {
      updateMutation.mutate({ id: Number(id), data: activityData });
    } else {
      createMutation.mutate(activityData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/activities')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">
            {isEditing ? 'Edit Activity' : 'Add New Activity'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update activity details' : 'Create a new activity for your tourism platform'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg border">
        <Input 
          placeholder="Title" 
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category</label>
            <Select 
              value={watch('category')} 
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger><SelectValue placeholder="Select or type category" /></SelectTrigger>
              <SelectContent>
                {categoriesData && categoriesData.length > 0 ? (
                  categoriesData.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Loading categories...</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or type a new category"
              className="mt-2"
              value={watch('category') && (!categoriesData || !categoriesData.includes(watch('category'))) ? watch('category') : ''}
              onChange={(e) => {
                const value = e.target.value;
                setValue('category', value);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Destination</label>
            <Select 
              value={watch('destinationId')} 
              onValueChange={(value) => setValue('destinationId', value)}
            >
              <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
              <SelectContent>
                {destinationsData?.content && destinationsData.content.length > 0 ? (
                  destinationsData.content.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>Loading destinations...</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Input placeholder="Short Description" {...register('shortDescription')} />
        <Textarea placeholder="Full Description" className="min-h-[100px]" {...register('fullDescription')} />
        
        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="Price ($)" type="number" step="0.01" {...register('price', { required: 'Price is required' })} />
          <Input placeholder="Duration" {...register('duration')} />
          <Select 
            value={watch('difficultyLevel')} 
            onValueChange={(value) => setValue('difficultyLevel', value)}
          >
            <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              {["Easy", "Moderate", "Challenging", "Expert"].map((d) => (
                <SelectItem key={d} value={d.toLowerCase()}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Images</label>
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
              {isUploading ? "Uploading..." : "Drop images here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF, WEBP (max 10MB)
            </p>
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
          {uploadedImages.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={getImageUrl(url)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Textarea placeholder="Itinerary (one step per line)" {...register('itinerary')} />
        
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Departure Location" {...register('departureLocation')} />
          <Input placeholder="Return Location" {...register('returnLocation')} />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Meeting Time (e.g., 15 Minutes Before Departure time 8 am)" {...register('meetingTime')} />
          <Input placeholder="Availability (e.g., Everyday)" {...register('availability')} />
        </div>
        
        <Textarea placeholder="What to Expect" className="min-h-[100px]" {...register('whatToExpect')} />
        
        <Textarea placeholder="Complementaries / What to Bring (one item per line)" {...register('complementaries')} />
        
        <Input placeholder="Map URL (optional)" {...register('mapUrl')} />
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Available Dates</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDates.length && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDates.length > 0 ? (
                  <span>
                    {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span>Pick available dates</span>
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
                <div className="p-3 border-t">
                  <div className="flex flex-wrap gap-2">
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
                          className="ml-1 hover:text-destructive"
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
                    className="w-full mt-2"
                    onClick={() => {
                      setSelectedDates([]);
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" type="button" onClick={() => navigate('/admin/activities')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (isEditing ? 'Update Activity' : 'Create Activity')}
          </Button>
        </div>
      </form>
    </div>
  );
}
