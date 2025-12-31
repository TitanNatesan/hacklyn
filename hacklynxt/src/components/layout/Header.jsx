"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Users,
    Trophy,
    Menu,
    X,
    LayoutDashboard,
    LogOut,
    User
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isAdmin = isAuthenticated && user?.is_staff;

    const getInitials = () => {
        if (!user) return "JD";
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user.username?.substring(0, 2).toUpperCase() || "JD";
    };

    const isActive = (path) => pathname === path;

    const navLinks = isAuthenticated ? [
        { href: isAdmin ? "/dashboard/admin" : "/dashboard", label: "Dashboard" },
        { href: "/events", label: "Events" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ] : [
        { href: "/events", label: "Explore Events" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    const handleSignOut = () => {
        logout();
        toast.success("Signed out successfully");
        router.push("/");
    };

    // Redirect authenticated users from auth page to dashboard
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (pathname === "/" || pathname.startsWith("/auth")) {
                router.replace(isAdmin ? "/dashboard/admin" : "/dashboard");
            }
        }
    }, [isAuthenticated, isLoading, isAdmin, pathname, router]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border shadow-soft">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={isAuthenticated ? (isAdmin ? "/dashboard/admin" : "/dashboard") : "/"} className="flex items-center gap-2 group">
                        <Image
                            src="/hacklyn.png"
                            alt="Hacklyn"
                            width={36}
                            height={36}
                            className="object-contain group-hover:scale-105 transition-transform"
                        />
                        <span className="font-display font-bold text-xl text-foreground">
                            Hacklyn
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.href)
                                    ? "bg-primary text-primary-foreground shadow-soft"
                                    : "text-muted-foreground hover:text-foreground hover:bg-neutral-100"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.profile_picture || user?.avatar || ""} alt={user?.username} />
                                            <AvatarFallback>
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || "Guest"}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email || "No email"}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push(isAdmin ? "/dashboard/admin" : "/dashboard")}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </DropdownMenuItem>
                                    {!isAdmin && (
                                        <>
                                            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                                                <User className="mr-2 h-4 w-4" />
                                                <span>Profile</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push("/dashboard/organizer")}>
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>Organize Event</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="text-destructive focus:bg-red-600 focus:text-white hover:bg-red-600 hover:text-white cursor-pointer transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/auth?mode=login">Sign In</Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link href="/auth?mode=register">Get Started</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border animate-fade-in">
                        <nav className="flex flex-col gap-2">
                            {isAuthenticated && !isAdmin && (
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/dashboard")
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2 flex items-center gap-3 mb-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user?.profile_picture || user?.avatar || ""} />
                                                <AvatarFallback>{getInitials()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={handleSignOut}
                                            className="w-full text-destructive hover:bg-red-600 hover:text-white transition-colors"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href="/auth?mode=login">Sign In</Link>
                                        </Button>
                                        <Button variant="default" asChild className="w-full">
                                            <Link href="/auth?mode=register">Get Started</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
