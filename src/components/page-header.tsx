import Image from "next/image";

export default function PageHeader() {
  return (
    <header className="container mx-auto px-4 py-8 md:px-8">
      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo.svg"
          alt="SimpliPlan Logo"
          width={280}
          height={70}
          priority
        />
      </div>
    </header>
  );
}
