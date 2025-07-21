import { CropDoctorClient } from './_components/crop-doctor-client';

export default function CropDoctorPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">AI Crop Doctor</h1>
      <p className="text-muted-foreground mb-8">
        Upload a clear image of an affected crop leaf to get an instant diagnosis and suggested solutions.
      </p>
      <CropDoctorClient />
    </div>
  );
}
