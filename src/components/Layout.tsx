import { ReactNode } from "react";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";
import { 
  CreditCard, 
  Smartphone, 
  Users, 
  History, 
  LayoutDashboard,
  Menu,
  TrendingDown,
  Home
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "SIM Cards", href: "/sim-cards", icon: CreditCard },
    { name: "Executive Summary", href: "/executive-summary", icon: TrendingDown },
    { name: "Devices", href: "/devices", icon: Smartphone },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "History", href: "/history", icon: History },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">BKT-SimCare</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitch />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 border-r bg-background min-h-[calc(100vh-4rem)] sticky top-16 flex-col gap-2 p-4">
          <NavLinks />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}