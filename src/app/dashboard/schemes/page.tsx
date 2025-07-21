import { SchemeNavigatorClient } from "./_components/scheme-navigator-client";

export default function SchemeNavigatorPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2 font-headline">Government Scheme Navigator</h1>
      <p className="text-muted-foreground mb-8">
        Ask about any government scheme for farmers to get clear information on eligibility and how to apply.
      </p>
      <SchemeNavigatorClient />
    </div>
  );
}
