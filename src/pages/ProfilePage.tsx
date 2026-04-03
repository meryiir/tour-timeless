import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  User, Mail, Phone, Save, ArrowLeft, UserCircle, Edit2, 
  BookOpen, Settings, Calendar, MapPin, Users, DollarSign, 
  FileText, CheckCircle2, Clock, XCircle, AlertCircle, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { api, type ClientContactMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import FadeInSection from "@/components/FadeInSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatIsoDateOnly } from "@/lib/dateDisplay";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface SettingsFormData {
  notifications: boolean;
  emailUpdates: boolean;
  language: string;
  currency: string;
}

const getStatusBadge = (status: string, t: any) => {
  const statusLower = status.toLowerCase();
  if (statusLower === 'confirmed' || statusLower === 'completed') {
    return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />{t("profile.confirmed")}</Badge>;
  }
  if (statusLower === 'pending') {
    return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />{t("profile.pending")}</Badge>;
  }
  if (statusLower === 'cancelled') {
    return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"><XCircle className="h-3 w-3 mr-1" />{t("profile.cancelled")}</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, login: setAuth } = useAuth();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [contactPage, setContactPage] = useState(0);
  const [threadDrafts, setThreadDrafts] = useState<Record<number, string>>({});
  const activeTab = searchParams.get('tab') || 'profile';
  
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerSettings,
    handleSubmit: handleSubmitSettings,
    formState: { errors: settingsErrors },
    reset: resetSettings,
    watch: watchSettings,
    setValue: setSettingsValue,
  } = useForm<SettingsFormData>({
    defaultValues: {
      notifications: true,
      emailUpdates: true,
      language: 'en',
      currency: currency,
    },
  });

  // Sync currency changes from form to context
  const watchedCurrency = watchSettings("currency");
  useEffect(() => {
    if (watchedCurrency && watchedCurrency !== currency) {
      setCurrency(watchedCurrency);
    }
  }, [watchedCurrency, currency, setCurrency]);

  // Sync currency from context to form when changed in header
  useEffect(() => {
    setSettingsValue("currency", currency);
  }, [currency, setSettingsValue]);

  const isClient = user?.role === 'ROLE_CLIENT';

  // Fetch bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => api.getMyBookings(0, 20),
    enabled: !!user && activeTab === 'bookings',
  });

  const { data: contactData, isLoading: contactLoading } = useQuery({
    queryKey: ['myContactMessages', contactPage],
    queryFn: () => api.getMyContactMessages(contactPage, 50),
    enabled: !!user && !!isClient && activeTab === 'messages',
  });

  useEffect(() => {
    if (activeTab === 'messages' && user && !isClient) {
      setSearchParams({ tab: 'profile' });
    }
  }, [activeTab, user, isClient, setSearchParams]);

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      resetSettings({
        notifications: true,
        emailUpdates: true,
        language: 'en',
        currency: currency,
      });
    }
  }, [user, resetProfile, resetSettings, currency]);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    if (value !== "messages") {
      setContactPage(0);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    if (!user?.id) {
      toast({
        title: t("common.error"),
        description: t("profile.userInfoNotAvailable"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await api.updateProfile(user.id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });

      const token = localStorage.getItem('token');
      if (token && updatedUser) {
        setAuth(updatedUser, token);
      }

      toast({
        title: t("common.success"),
        description: t("profile.profileUpdatedSuccess"),
        variant: "success",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("profile.failedToUpdateProfile"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSettings = async (data: SettingsFormData) => {
    setIsLoading(true);
    try {
      // Save settings to localStorage (or API if available)
      localStorage.setItem('userSettings', JSON.stringify(data));
      
      toast({
        title: t("common.success"),
        description: t("profile.settingsSavedSuccess"),
        variant: "success",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("profile.failedToSaveSettings"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t("profile.pleaseSignIn")}</p>
          <Button onClick={() => navigate("/login")}>{t("auth.signIn")}</Button>
        </div>
      </div>
    );
  }

  const bookings = bookingsData?.content || [];
  const contactThreads: ClientContactMessage[] = contactData?.content ?? [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <FadeInSection>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">{t("profile.myAccount")}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{t("profile.manageAccount")}</p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* User Info Card */}
        <FadeInSection delay={0.1}>
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/12 flex items-center justify-center border-4 border-primary/20">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  {user.role && (
                    <Badge className="mt-2 bg-primary/10 text-primary border-primary/20">
                      {user.role === 'ROLE_ADMIN' ? t("profile.administrator") : t("profile.member")}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInSection>

        {/* Tabs */}
        <FadeInSection delay={0.2}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList
              className={
                isClient
                  ? "grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto sm:inline-flex gap-1 h-auto py-1"
                  : "grid w-full grid-cols-3 sm:w-auto sm:inline-flex"
              }
            >
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("profile.title")}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t("profile.bookings")}
                {bookings.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{bookings.length}</Badge>
                )}
              </TabsTrigger>
              {isClient && (
                <TabsTrigger value="messages" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("profile.contactMessages")}
                </TabsTrigger>
              )}
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t("profile.settings")}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="border-2 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("profile.personalInfo")}</CardTitle>
                      <CardDescription>{t("profile.updatePersonalDetails")}</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        {t("profile.editProfile")}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium text-foreground flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {t("auth.firstName")}
                        </label>
                        <Input
                          id="firstName"
                          placeholder={t("profile.firstNamePlaceholder")}
                          className="h-11"
                          disabled={!isEditing}
                          {...registerProfile("firstName", {
                            required: t("auth.firstNameRequired"),
                            maxLength: { value: 100, message: t("profile.firstNameMaxLength") },
                          })}
                        />
                        {profileErrors.firstName && (
                          <p className="text-xs text-destructive mt-1">{profileErrors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium text-foreground flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {t("auth.lastName")}
                        </label>
                        <Input
                          id="lastName"
                          placeholder={t("profile.lastNamePlaceholder")}
                          className="h-11"
                          disabled={!isEditing}
                          {...registerProfile("lastName", {
                            required: t("auth.lastNameRequired"),
                            maxLength: { value: 100, message: t("profile.lastNameMaxLength") },
                          })}
                        />
                        {profileErrors.lastName && (
                          <p className="text-xs text-destructive mt-1">{profileErrors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {t("profile.emailAddress")}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("profile.emailPlaceholder")}
                        className="h-11"
                        disabled
                        {...registerProfile("email")}
                      />
                      <p className="text-xs text-muted-foreground">{t("profile.emailCannotBeChanged")}</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {t("profile.phoneNumber")}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t("profile.phonePlaceholder")}
                        className="h-11"
                        disabled={!isEditing}
                        {...registerProfile("phone", {
                          pattern: {
                            value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                            message: t("profile.invalidPhoneNumber"),
                          },
                        })}
                      />
                      {profileErrors.phone && (
                        <p className="text-xs text-destructive mt-1">{profileErrors.phone.message}</p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={isLoading} className="gap-2">
                          <Save className="h-4 w-4" />
                          {isLoading ? t("profile.saving") : t("profile.saveChanges")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            resetProfile();
                          }}
                          disabled={isLoading}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>{t("profile.accountInformation")}</CardTitle>
                  <CardDescription>{t("profile.accountDetails")}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("profile.accountStatus")}</p>
                      <p className="text-base font-semibold text-foreground">
                        {user.active ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {t("profile.active")}
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            {t("profile.inactive")}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t("profile.memberSince")}</p>
                      <p className="text-base font-semibold text-foreground">
                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-6 mt-6">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>{t("profile.bookings")}</CardTitle>
                  <CardDescription>{t("profile.viewManageBookings")}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">{t("profile.loadingBookings")}</p>
                      </div>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{t("profile.noBookingsYet")}</h3>
                      <p className="text-muted-foreground mb-4">{t("profile.startExploring")}</p>
                      <Button onClick={() => navigate("/activities")}>{t("profile.browseActivities")}</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking: any) => (
                        <Card key={booking.id} className="border-2 border-border hover:border-primary/40 transition-colors">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="font-semibold text-lg text-foreground mb-1">
                                      {booking.activity?.slug ? (
                                        <Link
                                          to={`/activities/${booking.activity.slug}`}
                                          className="hover:text-primary hover:underline"
                                        >
                                          {booking.activity?.title || "Activity"}
                                        </Link>
                                      ) : (
                                        booking.activity?.title || "Activity"
                                      )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {t("profile.reference")}: <span className="font-mono font-medium">{booking.bookingReference}</span>
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status, t)}
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">{t("profile.travelDate")}</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {booking.travelDate ? formatIsoDateOnly(booking.travelDate) : "N/A"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">{t("profile.guests")}</p>
                                      <p className="text-sm font-medium text-foreground">{booking.numberOfPeople}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">{t("profile.totalPrice")}</p>
                                      <p className="text-sm font-medium text-foreground">{formatPrice(Number(booking.totalPrice) || 0)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">{t("profile.bookedOn")}</p>
                                      <p className="text-sm font-medium text-foreground">
                                        {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {booking.specialRequest && (
                                  <div className="pt-2">
                                    <p className="text-xs text-muted-foreground mb-1">{t("profile.specialRequest")}:</p>
                                    <p className="text-sm text-foreground">{booking.specialRequest}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact replies (clients only) */}
            {isClient && (
              <TabsContent value="messages" className="space-y-6 mt-6">
                <Card className="border-2 border-border">
                  <CardHeader>
                    <CardTitle>{t("profile.contactMessages")}</CardTitle>
                    <CardDescription>{t("profile.contactMessagesDesc")}</CardDescription>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-6">
                    {contactLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">{t("profile.loadingContactMessages")}</p>
                      </div>
                    ) : contactThreads.length === 0 ? (
                      <div className="text-center py-12 space-y-3">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="font-medium text-foreground">{t("profile.noContactMessages")}</p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          {t("profile.contactUsHint")}
                        </p>
                        <Button variant="outline" onClick={() => navigate("/contact")}>
                          {t("nav.contact")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contactThreads.map((thread) => {
                          const draft = threadDrafts[thread.id] ?? "";
                          const entries = thread.thread ?? [];
                          return (
                            <Card key={thread.id} className="border border-border">
                              <CardContent className="pt-5 space-y-3">
                                <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                                  <span>{new Date(thread.createdAt).toLocaleString()}</span>
                                  {thread.repliedAt && (
                                    <Badge variant="secondary" className="text-xs">
                                      {t("profile.teamReply")}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-semibold text-foreground">{thread.subject}</p>

                                {entries.length > 0 ? (
                                  <div className="space-y-2">
                                    {entries.map((e) => (
                                      <div
                                        key={e.id}
                                        className={`rounded-lg border p-3 ${
                                          e.sender === "ADMIN"
                                            ? "border-primary/20 bg-primary/5"
                                            : "border-border bg-background"
                                        }`}
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                          <span className="font-medium">
                                            {e.sender === "ADMIN" ? t("profile.teamReply") : t("profile.yourQuestion")}
                                          </span>
                                          <span>{new Date(e.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="mt-2 text-sm whitespace-pre-wrap">
                                          {e.body}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                      {t("profile.yourQuestion")}
                                    </p>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {thread.message}
                                    </p>
                                    {thread.adminReply ? (
                                      <div className="mt-3 rounded-lg bg-primary/5 border border-primary/15 p-3">
                                        <p className="text-xs font-medium text-primary mb-1">
                                          {t("profile.teamReply")}
                                        </p>
                                        <p className="text-sm text-foreground whitespace-pre-wrap">
                                          {thread.adminReply}
                                        </p>
                                      </div>
                                    ) : (
                                      <p className="mt-3 text-sm text-muted-foreground italic">
                                        {t("profile.waitingForReply")}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="pt-2 space-y-2">
                                  <Textarea
                                    placeholder="Write a follow-up message…"
                                    className="min-h-[100px]"
                                    value={draft}
                                    onChange={(e) =>
                                      setThreadDrafts((d) => ({ ...d, [thread.id]: e.target.value }))
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={async () => {
                                        const text = draft.trim();
                                        if (!text) return;
                                        try {
                                          await api.postMyContactThreadMessage(thread.id, text);
                                          setThreadDrafts((d) => ({ ...d, [thread.id]: "" }));
                                        } catch (e) {
                                          toast({
                                            title: t("common.error"),
                                            description: e instanceof Error ? e.message : "Failed to send message",
                                            variant: "destructive",
                                          });
                                        }
                                      }}
                                    >
                                      Send
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}

                        {contactData && contactData.totalPages > 1 && (
                          <div className="flex justify-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={contactPage === 0}
                              onClick={() => setContactPage((p) => Math.max(0, p - 1))}
                            >
                              Previous
                            </Button>
                            <span className="flex items-center text-sm text-muted-foreground">
                              Page {contactPage + 1} of {contactData.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={contactPage >= contactData.totalPages - 1}
                              onClick={() => setContactPage((p) => p + 1)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-8">
              <Card className="border-2 border-border">
                <CardHeader>
                  <CardTitle>{t("profile.preferences")}</CardTitle>
                  <CardDescription>{t("profile.customizeSettings")}</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmitSettings(onSubmitSettings)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-foreground">{t("profile.emailNotifications")}</label>
                          <p className="text-xs text-muted-foreground">{t("profile.receiveEmailUpdates")}</p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerSettings("emailUpdates")}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium text-foreground">{t("profile.pushNotifications")}</label>
                          <p className="text-xs text-muted-foreground">{t("profile.getNotified")}</p>
                        </div>
                        <input
                          type="checkbox"
                          {...registerSettings("notifications")}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("profile.language")}</label>
                        <select
                          {...registerSettings("language")}
                          className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="en">{t("languages.en")}</option>
                          <option value="fr">{t("languages.fr")}</option>
                          <option value="es">{t("languages.es")}</option>
                          <option value="de">{t("languages.de")}</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t("profile.currency")}</label>
                        <select
                          {...registerSettings("currency")}
                          className="w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {currencies.map((curr) => (
                            <option key={curr.code} value={curr.code}>
                              {curr.code} ({curr.symbol}) - {curr.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button type="submit" disabled={isLoading} className="gap-2">
                        <Save className="h-4 w-4" />
                        {isLoading ? t("profile.saving") : t("profile.saveSettings")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeInSection>
      </div>
    </div>
  );
}
