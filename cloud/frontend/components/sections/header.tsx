import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Header() {
  return (
    <header className="w-full bg-gray-background">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-primary">
              SkillForge
            </span>
          </Link>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
