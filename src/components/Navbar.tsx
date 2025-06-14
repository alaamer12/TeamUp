import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Users, Languages } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { motion } from "framer-motion";
import { useLanguage } from "./LanguageProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TeamUp
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t('navbar.home')}
              </Link>
              <Link 
                to="/listings" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/listings') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t('navbar.listings')}
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/about') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {t('navbar.about')}
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-9 h-9 rounded-full"
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => setLanguage("ar")}
                    className={language === "ar" ? "bg-muted" : ""}
                  >
                    العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    className={language === "en" ? "bg-muted" : ""}
                  >
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="w-9 h-9 rounded-full"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
