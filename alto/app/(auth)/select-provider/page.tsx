import SelectProvider from "@/components/select-provider";
import { ModeToggle } from "@/components/ui";

export default async function SelectProviderPage() {
  return (
    <div className="relative h-screen flex items-center justify-center p-3">
      <div className="absolute top-5 right-5">
        <ModeToggle />
      </div>
      <SelectProvider />
    </div>
  );
}
