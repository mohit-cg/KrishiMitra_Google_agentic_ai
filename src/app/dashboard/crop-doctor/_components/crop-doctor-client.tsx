"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { diagnoseCropDisease, type DiagnoseCropDiseaseOutput } from '@/ai/flows/diagnose-crop-disease';
import { Leaf, Lightbulb, Package, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function CropDoctorClient() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseCropDiseaseOutput | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!imageData) {
      toast({
        title: "No Image Selected",
        description: "Please select an image of your crop to diagnose.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const diagnosisResult = await diagnoseCropDisease({ photoDataUri: imageData });
      setResult(diagnosisResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Diagnosis Failed",
        description: "An error occurred while analyzing the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Crop Image</CardTitle>
          <CardDescription>Select a photo of the affected plant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crop-image">Image File</Label>
            <Input id="crop-image" type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          {imagePreview && (
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <Image src={imagePreview} alt="Crop preview" layout="fill" objectFit="cover" />
            </div>
          )}
          <Button onClick={handleSubmit} disabled={isLoading || !imageData} className="w-full">
            {isLoading ? "Diagnosing..." : "Diagnose Disease"}
          </Button>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4 font-headline">Diagnosis Result</h2>
        {isLoading && <LoadingSkeleton />}
        {result && !isLoading && (
          <div className="space-y-4">
            <Alert>
              <Leaf className="h-4 w-4" />
              <AlertTitle>Diagnosis</AlertTitle>
              <AlertDescription>{result.diagnosis}</AlertDescription>
            </Alert>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Suggested Solutions</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: result.solutions.replace(/\n/g, '<br />') }} />
              </AlertDescription>
            </Alert>
          </div>
        )}
        {!result && !isLoading && (
          <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
            <CardContent>
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Your diagnosis result will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
);
