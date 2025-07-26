
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Check, ChevronsUpDown, Upload } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useTranslation } from '@/contexts/language-context';
import { translateText } from '@/ai/flows/translate-text';


const districts = [
    { value: "Port Blair, Andaman & Nicobar", label: "Port Blair, Andaman & Nicobar" },
    { value: "Visakhapatnam, Andhra Pradesh", label: "Visakhapatnam, Andhra Pradesh" },
    { value: "Itanagar, Arunachal Pradesh", label: "Itanagar, Arunachal Pradesh" },
    { value: "Guwahati, Assam", label: "Guwahati, Assam" },
    { value: "Patna, Bihar", label: "Patna, Bihar" },
    { value: "Chandigarh, Chandigarh", label: "Chandigarh, Chandigarh" },
    { value: "Raipur, Chhattisgarh", label: "Raipur, Chhattisgarh" },
    { value: "Silvassa, Dadra & Nagar Haveli", label: "Silvassa, Dadra & Nagar Haveli" },
    { value: "Daman, Daman & Diu", label: "Daman, Daman & Diu" },
    { value: "New Delhi, Delhi", label: "New Delhi, Delhi" },
    { value: "Panaji, Goa", label: "Panaji, Goa" },
    { value: "Ahmedabad, Gujarat", label: "Ahmedabad, Gujarat" },
    { value: "Surat, Gujarat", label: "Surat, Gujarat" },
    { value: "Vadodara, Gujarat", label: "Vadodara, Gujarat" },
    { value: "Faridabad, Haryana", label: "Faridabad, Haryana" },
    { value: "Shimla, Himachal Pradesh", label: "Shimla, Himachal Pradesh" },
    { value: "Srinagar, Jammu & Kashmir", label: "Srinagar, Jammu & Kashmir" },
    { value: "Ranchi, Jharkhand", label: "Ranchi, Jharkhand" },
    { value: "Bengaluru, Karnataka", label: "Bengaluru, Karnataka" },
    { value: "Mysuru, Karnataka", label: "Mysuru, Karnataka" },
    { value: "Thiruvananthapuram, Kerala", label: "Thiruvananthapuram, Kerala" },
    { value: "Kavaratti, Lakshadweep", label: "Kavaratti, Lakshadweep" },
    { value: "Bhopal, Madhya Pradesh", label: "Bhopal, Madhya Pradesh" },
    { value: "Indore, Madhya Pradesh", label: "Indore, Madhya Pradesh" },
    { value: "Pune, Maharashtra", label: "Pune, Maharashtra" },
    { value: "Mumbai, Maharashtra", label: "Mumbai, Maharashtra" },
    { value: "Nagpur, Maharashtra", label: "Nagpur, Maharashtra" },
    { value: "Nashik, Maharashtra", label: "Nashik, Maharashtra" },
    { value: "Aurangabad, Maharashtra", label: "Aurangabad, Maharashtra" },
    { value: "Imphal, Manipur", label: "Imphal, Manipur" },
    { value: "Shillong, Meghalaya", label: "Shillong, Meghalaya" },
    { value: "Aizawl, Mizoram", label: "Aizawl, Mizoram" },
    { value: "Kohima, Nagaland", label: "Kohima, Nagaland" },
    { value: "Bhubaneswar, Odisha", label: "Bhubaneswar, Odisha" },
    { value: "Puducherry, Puducherry", label: "Puducherry, Puducherry" },
    { value: "Ludhiana, Punjab", label: "Ludhiana, Punjab" },
    { value: "Amritsar, Punjab", label: "Amritsar, Punjab" },
    { value: "Jaipur, Rajasthan", label: "Jaipur, Rajasthan" },
    { value: "Jodhpur, Rajasthan", label: "Jodhpur, Rajasthan" },
    { value: "Gangtok, Sikkim", label: "Gangtok, Sikkim" },
    { value: "Chennai, Tamil Nadu", label: "Chennai, Tamil Nadu" },
    { value: "Coimbatore, Tamil Nadu", label: "Coimbatore, Tamil Nadu" },
    { value: "Hyderabad, Telangana", label: "Hyderabad, Telangana" },
    { value: "Agartala, Tripura", label: "Agartala, Tripura" },
    { value: "Lucknow, Uttar Pradesh", label: "Lucknow, Uttar Pradesh" },
    { value: "Kanpur, Uttar Pradesh", label: "Kanpur, Uttar Pradesh" },
    { value: "Dehradun, Uttarakhand", label: "Dehradun, Uttarakhand" },
    { value: "Kolkata, West Bengal", label: "Kolkata, West Bengal" },
]


export default function ProfilePage() {
  const { user, userProfile, updateUserProfile, uploadProfileImage, loading } = useAuth();
  const { t, language: currentLanguage, setLanguage: setAppLanguage } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for form inputs (untranslated, canonical values)
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState(currentLanguage);
  const [crops, setCrops] = useState('');

  // State for translated display values shown in the UI
  const [translatedDisplayName, setTranslatedDisplayName] = useState('');
  const [translatedCrops, setTranslatedCrops] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [open, setOpen] = useState(false);

  // This effect runs when the component mounts or the user profile data changes.
  // It populates the form with the canonical (usually English) data from the profile.
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
      setLocation(userProfile.location || 'Pune, Maharashtra');
      setLanguage(userProfile.language || 'en');
      setCrops(userProfile.crops || '');
    } else if (user) {
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
    }
  }, [user, userProfile]);

  // This callback is for translating the canonical data into the currently selected language for display.
  const translateDataForDisplay = useCallback(async () => {
    if (currentLanguage === 'en') {
      setTranslatedDisplayName(displayName);
      setTranslatedCrops(crops);
      return;
    }

    setIsTranslating(true);
    try {
      const [nameRes, cropsRes] = await Promise.all([
        displayName ? translateText({ text: displayName, targetLanguage: currentLanguage as 'hi' | 'kn' | 'bn' | 'bho' }) : Promise.resolve({ translatedText: '' }),
        crops ? translateText({ text: crops, targetLanguage: currentLanguage as 'hi' | 'kn' | 'bn' | 'bho' }) : Promise.resolve({ translatedText: '' }),
      ]);
      setTranslatedDisplayName(nameRes.translatedText);
      setTranslatedCrops(cropsRes.translatedText);
    } catch (error) {
      console.error("Failed to translate user data for display", error);
      // On error, fall back to showing the untranslated data.
      setTranslatedDisplayName(displayName);
      setTranslatedCrops(crops);
    } finally {
      setIsTranslating(false);
    }
  }, [displayName, crops, currentLanguage]);

  // This effect triggers the translation whenever the canonical data or the current language changes.
  useEffect(() => {
    translateDataForDisplay();
  }, [translateDataForDisplay]);

  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'FP';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Always save the untranslated (canonical) values to the database.
      await updateUserProfile({
        displayName,
        location,
        language,
        crops,
      });
      // Also update language in context to trigger app-wide re-render.
      setAppLanguage(language as 'en' | 'hi' | 'kn' | 'bn' | 'bho');

      toast({
        title: t('toast.profileUpdated'),
        description: t('toast.profileUpdatedDesc'),
      });
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: t('toast.updateFailed'),
        description: t('toast.updateFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await uploadProfileImage(file);
        toast({
          title: t('toast.photoUpdated'),
          description: t('toast.photoUpdatedDesc'),
        });
      } catch (error) {
        // Error toast is handled in useAuth hook
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-headline">{t('profile.title')}</h1>
          <p className="text-muted-foreground">
            {t('profile.description')}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('profile.backToDashboard')}
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t('profile.cardTitle')}</CardTitle>
          <CardDescription>
            {t('profile.cardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile?.photoURL || `https://placehold.co/100x100.png`} alt={displayName} data-ai-hint="smiling indian farmer"/>
                <AvatarFallback className="text-3xl">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading}/>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                 <Upload className="mr-2 h-4 w-4" />
                {isUploading ? t('profile.uploading') : t('profile.changePhoto')}
              </Button>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.fullName')}</Label>
              <Input id="name" value={isTranslating ? '...' : translatedDisplayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">{t('profile.location')}</Label>
               <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {location
                        ? (districts.find((district) => district.value === location)?.label || location)
                        : t('profile.selectDistrict')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder={t('profile.searchDistrict')} />
                      <CommandEmpty>{t('profile.noDistrictFound')}</CommandEmpty>
                       <CommandList>
                        <CommandGroup>
                            {districts.map((district) => (
                            <CommandItem
                                key={district.value}
                                value={district.value}
                                onSelect={() => {
                                  setLocation(district.value === location ? "" : district.value)
                                  setOpen(false)
                                }}
                                className="transition-all duration-200 ease-in-out hover:bg-accent"
                            >
                                <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    location === district.value ? "opacity-100" : "opacity-0"
                                )}
                                />
                                {district.label}
                            </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t('profile.language')}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('profile.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="kn">Kannada (ಕನ್ನಡ)</SelectItem>
                  <SelectItem value="bn">Bangla (বাংলা)</SelectItem>
                  <SelectItem value="bho">Bhojpuri (भोजपुरी)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="crops">{t('profile.myCrops')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('profile.myCropsDescription')}
            </p>
            <Input id="crops" value={isTranslating ? '...' : translatedCrops} onChange={(e) => setCrops(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveChanges} disabled={isSaving || isUploading || isTranslating}>
              {isSaving ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


const ProfileSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Skeleton className="h-10 w-1/3 mb-2" />
      <Skeleton className="h-5 w-1/2 mb-8" />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-28" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    