import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { useToast } from "@/hooks/use-toast";
import FadeInSection from "@/components/FadeInSection";
import { FileText, DatabaseBackup, Upload } from "lucide-react";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

interface TranslationData {
  languageCode: string;
  siteName: string;
  bannerTitle: string;
  bannerSubtitle: string;
  address: string;
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [formData, setFormData] = useState({
    siteName: "",
    logoUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    bannerTitle: "",
    bannerSubtitle: "",
  });
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({
    en: { languageCode: 'en', siteName: '', bannerTitle: '', bannerSubtitle: '', address: '' },
    fr: { languageCode: 'fr', siteName: '', bannerTitle: '', bannerSubtitle: '', address: '' },
    es: { languageCode: 'es', siteName: '', bannerTitle: '', bannerSubtitle: '', address: '' },
    de: { languageCode: 'de', siteName: '', bannerTitle: '', bannerSubtitle: '', address: '' },
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pgDumpLoading, setPgDumpLoading] = useState(false);
  const [pgUseInserts, setPgUseInserts] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPassword, setImportPassword] = useState("");
  const [importNeedsPassword, setImportNeedsPassword] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const canStartImport =
    !!importFile && (!importNeedsPassword || importPassword.length >= 8);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => adminApi.getSettings(),
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        siteName: settingsData.siteName || "",
        logoUrl: settingsData.logoUrl || "",
        contactEmail: settingsData.contactEmail || "",
        contactPhone: settingsData.contactPhone || "",
        address: settingsData.address || "",
        facebookUrl: settingsData.facebookUrl || "",
        instagramUrl: settingsData.instagramUrl || "",
        twitterUrl: settingsData.twitterUrl || "",
        youtubeUrl: settingsData.youtubeUrl || "",
        bannerTitle: settingsData.bannerTitle || "",
        bannerSubtitle: settingsData.bannerSubtitle || "",
      });
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare translations array (exclude English as it's in main form)
    const translationArray = Object.entries(translations)
      .filter(([code]) => code !== 'en')
      .filter(([, data]) => data.siteName || data.bannerTitle || data.bannerSubtitle || data.address)
      .map(([code, data]) => ({
        languageCode: code,
        siteName: data.siteName || '',
        bannerTitle: data.bannerTitle || '',
        bannerSubtitle: data.bannerSubtitle || '',
        address: data.address || '',
      }));

    const settingsData: any = {
      siteName: formData.siteName,
      logoUrl: formData.logoUrl,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      address: formData.address,
      facebookUrl: formData.facebookUrl,
      instagramUrl: formData.instagramUrl,
      twitterUrl: formData.twitterUrl,
      youtubeUrl: formData.youtubeUrl,
      bannerTitle: formData.bannerTitle,
      bannerSubtitle: formData.bannerSubtitle,
      translations: translationArray,
    };

    updateMutation.mutate(settingsData);
  };

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setImportFile(f);
    if (!f) {
      setImportNeedsPassword(true);
      return;
    }
    try {
      const text = await f.text();
      const j = JSON.parse(text) as { users?: unknown[] };
      setImportNeedsPassword(Array.isArray(j.users) && j.users.length > 0);
    } catch {
      setImportNeedsPassword(true);
    }
  };

  const executeImport = async () => {
    if (!importFile) return;
    if (importNeedsPassword && importPassword.length < 8) return;
    setImportDialogOpen(false);
    setImportLoading(true);
    try {
      const result = await adminApi.importBackup(
        importFile,
        importNeedsPassword ? importPassword : ""
      );
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      queryClient.clear();
      toast({
        title: "Restore complete",
        description: `${result.destinations} destinations, ${result.activities} activities, ${result.users} users. You can sign in now.`,
      });
      navigate("/login");
    } catch (e) {
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handlePostgresDataDownload = async () => {
    setPgDumpLoading(true);
    try {
      await adminApi.downloadPostgresDataBackup(pgUseInserts);
      toast({
        title: "PostgreSQL data downloaded",
        description: "Data-only SQL. Tables must already exist to restore. If export failed, install pg_dump on the API server or set PG_DUMP_PATH.",
      });
    } catch (e) {
      toast({
        title: "PostgreSQL export failed",
        description: e instanceof Error ? e.message : "Could not export",
        variant: "destructive",
      });
    } finally {
      setPgDumpLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <FadeInSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DatabaseBackup className="h-5 w-5 text-primary" />
              <CardTitle>Data backup</CardTitle>
            </div>
            <CardDescription>
              <strong>PostgreSQL data (.sql):</strong> use the button below — the API runs <code className="text-xs bg-muted px-1 rounded">pg_dump</code> on the
              <em> server</em> (same PC as Spring Boot if you develop locally). Set env <code className="text-xs bg-muted px-1 rounded">PG_DUMP_PATH</code> to the full path
              to <code className="text-xs bg-muted px-1 rounded">pg_dump.exe</code> on Windows if needed. Alternatively run{" "}
              <code className="text-xs bg-muted px-1 rounded">scripts\postgres-backup.ps1</code> on your machine. No CREATE TABLE in the file.
              <br />
              <br />
              <code className="text-xs bg-muted px-1 rounded">uploads</code> are not included in the export.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center">
              <Button type="button" onClick={handlePostgresDataDownload} disabled={pgDumpLoading}>
                {pgDumpLoading ? "Exporting SQL…" : "Download PostgreSQL data (.sql)"}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pg-inserts"
                checked={pgUseInserts}
                onCheckedChange={(v) => setPgUseInserts(v === true)}
                disabled={pgDumpLoading}
              />
              <Label htmlFor="pg-inserts" className="text-sm font-normal cursor-pointer">
                Use INSERT statements instead of COPY (larger file, easier to read)
              </Label>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Upload className="h-4 w-4 text-muted-foreground" />
                Restore from backup
              </div>
              <p className="text-sm text-muted-foreground">
                Replaces all destinations, activities, users, bookings, reviews, favorites, and settings with the JSON file.
                Your current session will end—you must log in again afterward.
              </p>
              <div className="space-y-2 max-w-md">
                <Label htmlFor="backup-file">Backup JSON file</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFileChange}
                  disabled={importLoading}
                />
              </div>
              {importNeedsPassword && (
                <div className="space-y-2 max-w-md">
                  <Label htmlFor="import-password">Temporary password for all imported users</Label>
                  <Input
                    id="import-password"
                    type="password"
                    autoComplete="new-password"
                    value={importPassword}
                    onChange={(e) => setImportPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={importLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Same bcrypt hash is applied to every user row from the backup (passwords in the file are not real hashes).
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                disabled={!canStartImport || importLoading}
                onClick={() => setImportDialogOpen(true)}
              >
                {importLoading ? "Restoring…" : "Restore from backup…"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace all site data?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes every destination, activity, user, booking, review, favorite, and settings row in the database,
              then imports the selected file. You will be signed out immediately after. Use a recent export from this
              admin panel (<span className="font-mono text-xs">formatVersion 1.0</span>).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={executeImport}>
              Yes, restore now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit} className="space-y-8">
      <FadeInSection>
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic site configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input 
                id="siteName"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input 
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Contact details for your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input 
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input 
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      <FadeInSection delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">Facebook</Label>
              <Input 
                id="facebookUrl"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input 
                id="instagramUrl"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter</Label>
              <Input 
                id="twitterUrl"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input 
                id="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/..."
              />
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      <FadeInSection delay={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Homepage Banner</CardTitle>
            </div>
            <CardDescription>
              Banner content for your homepage. You can add translations in multiple languages using the tabs below.
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
                    <Label htmlFor={`siteName-${lang.code}`}>
                      Site Name {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                    </Label>
                    <Input 
                      id={`siteName-${lang.code}`}
                      value={lang.code === 'en' ? formData.siteName : translations[lang.code]?.siteName || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, siteName: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], siteName: e.target.value }
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bannerTitle-${lang.code}`}>
                      Banner Title {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                    </Label>
                    <Input 
                      id={`bannerTitle-${lang.code}`}
                      value={lang.code === 'en' ? formData.bannerTitle : translations[lang.code]?.bannerTitle || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, bannerTitle: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], bannerTitle: e.target.value }
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`bannerSubtitle-${lang.code}`}>
                      Banner Subtitle {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                    </Label>
                    <Input 
                      id={`bannerSubtitle-${lang.code}`}
                      value={lang.code === 'en' ? formData.bannerSubtitle : translations[lang.code]?.bannerSubtitle || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, bannerSubtitle: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], bannerSubtitle: e.target.value }
                          }));
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address-${lang.code}`}>
                      Address {lang.code !== 'en' && <span className="text-muted-foreground font-normal">({lang.name})</span>}
                    </Label>
                    <Textarea 
                      id={`address-${lang.code}`}
                      value={lang.code === 'en' ? formData.address : translations[lang.code]?.address || ''}
                      onChange={(e) => {
                        if (lang.code === 'en') {
                          setFormData({ ...formData, address: e.target.value });
                        } else {
                          setTranslations(prev => ({
                            ...prev,
                            [lang.code]: { ...prev[lang.code], address: e.target.value }
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
      </FadeInSection>

      <FadeInSection delay={0.4}>
        <Button size="lg" type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </FadeInSection>
    </form>
    </div>
  );
}
