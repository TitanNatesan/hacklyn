import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { authAPI } from "@/lib/api";
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
  const location = useLocation();
  const navigate = useNavigate();

  // Simple auth check - in production use a proper auth context
  const isLoggedIn = !!localStorage.getItem("isAuthenticated");
  const user = authAPI.getUser();
  const isAdmin = isLoggedIn && user?.is_staff;

  const getInitials = () => {
    if (!user) return "JD";
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  // If admin, we hide standard nav links.
  // If student, we show the main nav links.
  const navLinks = isLoggedIn ? [
    { href: isAdmin ? "/dashboard/admin" : "/dashboard", label: "Dashboard" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ] : [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleSignOut = () => {
    authAPI.logout();
    navigate("/");
  };

  // Enforce Session Security
  useEffect(() => {
    if (isLoggedIn) {
      if (isAdmin) {
        // Strict Admin Lock: Only /dashboard/admin allowed
        if (!location.pathname.startsWith("/dashboard/admin")) {
          toast.warning("Admin session active. Please sign out to access other pages.");
          navigate("/dashboard/admin", { replace: true });
        }
      } else {
        // Standard User Lock: App Routes + Public Info Pages
        // Allowed: /dashboard*, /events*, /complete-profile, /about, /contact
        const isAllowed =
          location.pathname.startsWith("/dashboard") ||
          location.pathname.startsWith("/events") ||
          location.pathname === "/complete-profile" ||
          location.pathname === "/about" ||
          location.pathname === "/contact";

        if (!isAllowed) {
          // If they are on the landing page (/) or auth pages, redirect to dashboard
          if (location.pathname === "/" || location.pathname.startsWith("/auth")) {
            navigate("/dashboard", { replace: true });
          }
        }
      }
    }
  }, [isLoggedIn, isAdmin, location.pathname, navigate]);



  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? (isAdmin ? "/dashboard/admin" : "/dashboard") : "/"} className="flex items-center gap-2 group">
            <img
              src="/hacklyn.png"
              alt="Hacklyn"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
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
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || ""} alt={user?.username} />
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
                  <DropdownMenuItem onClick={() => navigate(isAdmin ? "/dashboard/admin" : "/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  {!isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dashboard/organizer")}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Organize Event</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth?mode=login">Sign In</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/auth?mode=register">Get Started</Link>
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
              {isLoggedIn && !isAdmin && (
                <Link
                  to="/dashboard"
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
                  to={link.href}
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
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || ""} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={handleSignOut} className="w-full text-destructive hover:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/auth?mode=login">Sign In</Link>
                    </Button>
                    <Button variant="default" asChild className="w-full">
                      <Link to="/auth?mode=register">Get Started</Link>
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
