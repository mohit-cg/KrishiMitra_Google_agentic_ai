
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { Languages } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Language = 'en' | 'hi' | 'kn' | 'bn' | 'bho';

const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'bho', name: 'भोजपुरी' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const { updateUserProfile } = useAuth();

  const handleLanguageChange = async (newLang: string) => {
    const langCode = newLang as Language;
    setLanguage(langCode);
    try {
      await updateUserProfile({ language: langCode });
    } catch (error) {
      console.error("Failed to save language preference:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your language preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={language} onValueChange={handleLanguageChange}>
          {languages.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code}>
              {lang.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
