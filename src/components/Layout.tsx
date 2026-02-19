import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ThemeSwitch } from "./ThemeSwitch";
import {
  CreditCard,
  Users,
  History,
  Menu,
  TrendingDown,
  Home,
  Building2,
  Shield,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "./ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { profile, role, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: "Dashboard",          href: "/",                 icon: Home },
    { name: "SIM Cards",          href: "/sim-cards",        icon: CreditCard },
    { name: "Executive Summary",  href: "/executive-summary",icon: TrendingDown },
    { name: "Providers",          href: "/providers",        icon: Building2 },
    { name: "Devices",            href: "/devices",          icon: Building2 },
    { name: "Customers",          href: "/customers",        icon: Users },
    { name: "History",            href: "/history",          icon: History },
    // Admin-only
    ...(role === "admin"
      ? [{ name: "User Management", href: "/users", icon: Shield }]
      : []),
  ];

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.email?.[0] ?? "?").toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        {mounted && (
          <Sidebar className="hidden md:flex">
            <SidebarContent>
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/" className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                          <Building2 className="size-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">BKT SimCard Care</span>
                          <span className="truncate text-xs">Management System</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarHeader>

              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={router.pathname === item.href}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
              <SidebarMenu>
                {/* User info + logout */}
                {profile && (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-2 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold shrink-0">
                        {userInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile.full_name ?? profile.email}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-7 w-7"
                        onClick={handleSignOut}
                        title="Sign out"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <div className="px-2 py-1">
                    <ThemeSwitch />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <Sheet>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-4">
                    <div className="flex flex-col gap-4 mt-8">
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
                    </div>

                    <div className="mt-6 pt-4 border-t border-border space-y-3">
                      {profile && (
                        <div className="flex items-center gap-2 px-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                            {userInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {profile.full_name ?? profile.email}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                          </div>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleSignOut}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                      <ThemeSwitch />
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

          <main className="flex-1 p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
