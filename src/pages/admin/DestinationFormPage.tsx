import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, type Destination } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function DestinationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: destinationData, isLoading: destinationLoading } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => adminApi.getDestinationById(Number(id)),
    enabled: isEditing,
  });

  useEffect(() => {
    if (destinationData && isEditing) {
      setFormData({
        name: destinationData.name || "",
        country: destinationData.country || "",
        city: destinationData.city || "",
        description: destinationData.shortDescription || destinationData.fullDescription || "",
      });
      setUploadedImage(destinationData.imageUrl || null);
    }
  }, [destinationData, isEditing]);

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
      toast({ title: "Success", description: "Destination created successfully" });
      navigate('/admin/destinations');
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => adminApi.updateDestination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDestinations'] });
      toast({ title: "Success", description: "Destination updated successfully" });
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

  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return '/placeholder.svg';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
    return `${baseUrl}${url}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in required fields (Name and Country)", 
        variant: "destructive" 
      });
      return;
    }

    const destinationData: any = {
      name: formData.name,
      country: formData.country,
      city: formData.city || null,
      shortDescription: formData.description || null,
      fullDescription: formData.description || null,
      imageUrl: uploadedImage || null,
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
            {isEditing ? 'Edit Destination' : 'Add New Destination'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing ? 'Update destination details' : 'Create a new destination for your tourism platform'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
        <Input 
          placeholder="Destination Name" 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input 
          placeholder="Country" 
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          required
        />
        <Input 
          placeholder="City" 
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
        <Textarea 
          placeholder="Description" 
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <div>
          <label className="text-sm font-medium mb-2 block">Image</label>
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
              {isUploading ? "Uploading..." : "Drop image here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, GIF, WEBP (max 10MB)
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
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => navigate('/admin/destinations')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : (isEditing ? "Update Destination" : "Create Destination")}
          </Button>
        </div>
      </form>
    </div>
  );
}
