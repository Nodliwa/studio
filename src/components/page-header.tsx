import Image from "next/image";

export default function PageHeader() {
  return (
    <header className="container mx-auto px-4 py-6 md:px-8">
      <div className="flex flex-col items-center text-center">
        <Image
          src="https://storage.googleapis.com/aifirebase-7033b.appspot.com/public/logo.png"
          alt="SimpliPlan Logo"
          width={280}
          height={70}
          priority
        />
      </div>
    </header>
  );
}
