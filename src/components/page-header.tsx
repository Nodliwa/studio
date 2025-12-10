import { SimpliPlanLogo } from "./icons";

export default function PageHeader() {
  return (
    <header className="container mx-auto px-4 py-6 md:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
            <SimpliPlanLogo />
            <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground">
                SimpliPlan
            </h1>
        </div>
        <p className="mt-1 text-lg font-light" style={{color: '#4A4A4A'}}>
          Celebrating People
        </p>
      </div>
    </header>
  );
}
