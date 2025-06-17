import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, Plus, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard";
import { getTeamRequests, subscribeToListingsUpdates } from "../utils/db";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "../components/LanguageProvider";

const ITEMS_PER_PAGE = 6;
const MAJORS = ["CS", "IS", "SC", "AI"];

// Offline Alert Component
const OfflineAlert = ({ isOffline, t }: { isOffline: boolean; t: any }) => {
  if (!isOffline) return null;
  
  return (
    <Alert className="mx-3 sm:mx-4 mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
      <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle>{t('listings.offline_title')}</AlertTitle>
      <AlertDescription>
        {t('listings.offline_description')}
      </AlertDescription>
    </Alert>
  );
};

// Header Section Component
const ListingsHeader = ({ t }: { t: any }) => (
  <section className="py-8 sm:py-12 px-3 sm:px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
    <div className="container mx-auto max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-2">
          {t('listings.title')}
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
          {t('listings.subtitle')}
        </p>
        
        <div className="relative z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/">
                <Button className="gradient-button text-sm sm:text-base px-4 sm:px-6">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('listings.create_button')}
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="z-[9999]">
              <p>{t('listings.create_tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </div>
  </section>
);

// Search Input Component
const SearchInput = ({ searchTerm, setSearchTerm, t }: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  t: any;
}) => (
  <div className="flex-1 w-full sm:max-w-md">
    <div className="relative z-40">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            placeholder={t('listings.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </TooltipTrigger>
        <TooltipContent className="z-[9999]">
          <p>{t('listings.search_tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

// Filter Controls Component
const FilterControls = ({ filterMajor, setFilterMajor, filteredTeams, t }: {
  filterMajor: string;
  setFilterMajor: (major: string) => void;
  filteredTeams: any[];
  t: any;
}) => (
  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="relative z-40 w-full sm:w-48">
        <Tooltip>
          <TooltipTrigger asChild>
            <Select value={filterMajor} onValueChange={setFilterMajor}>
              <SelectTrigger className="w-full text-sm sm:text-base">
                <SelectValue placeholder={t('listings.filter_major')} />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                <SelectItem value="all">{t('listings.all_majors')}</SelectItem>
                {MAJORS.map((major) => (
                  <SelectItem key={major} value={major}>{major}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent className="z-[9999]">
            <p>{t('listings.filter_tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
    
    <div className="relative z-40">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {filteredTeams.length} {filteredTeams.length !== 1 ? t('listings.teams_count') : t('listings.teams_count_singular')}
          </div>
        </TooltipTrigger>
        <TooltipContent className="z-[9999]">
          <p>{t('listings.teams_count_tooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

// Filters Section Component
const FiltersSection = ({ searchTerm, setSearchTerm, filterMajor, setFilterMajor, filteredTeams, t }: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterMajor: string;
  setFilterMajor: (major: string) => void;
  filteredTeams: any[];
  t: any;
}) => (
  <section className="py-4 sm:py-6 lg:py-8 px-3 sm:px-4 border-b">
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-center justify-between">
        <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />
        <FilterControls 
          filterMajor={filterMajor} 
          setFilterMajor={setFilterMajor} 
          filteredTeams={filteredTeams} 
          t={t} 
        />
      </div>
    </div>
  </section>
);

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-muted rounded-lg h-48 sm:h-56 lg:h-64"></div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ searchTerm, filterMajor, t }: {
  searchTerm: string;
  filterMajor: string;
  t: any;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12 sm:py-16 lg:py-20 px-4"
  >
    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
    <h3 className="text-xl sm:text-2xl font-semibold mb-2">{t('listings.no_teams_title')}</h3>
    <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-md mx-auto">
      {searchTerm || filterMajor !== "all" 
        ? t('listings.no_teams_filters') 
        : t('listings.no_teams_empty')
      }
    </p>
    <div className="relative z-50">
      <Link to="/">
        <Button className="gradient-button text-sm sm:text-base px-4 sm:px-6">
          <Plus className="w-4 h-4 mr-2" />
          {t('listings.create_button')}
        </Button>
      </Link>
    </div>
  </motion.div>
);

// Pagination Component
const Pagination = ({ currentPage, setCurrentPage, totalPages, t }: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  t: any;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-8 sm:mt-12">
      <div className="flex items-center space-x-1 sm:space-x-2 relative z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              {t('listings.previous')}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[9999]">
            <p>{t('listings.previous_tooltip')}</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="hidden sm:flex items-center space-x-1">
          {[...Array(totalPages)].map((_, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8 sm:w-10 text-sm"
                >
                  {i + 1}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="z-[9999]">
                <p>{t('listings.page_tooltip')} {i + 1}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden px-3 py-2 text-sm text-muted-foreground">
          {currentPage} / {totalPages}
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-xs sm:text-sm px-2 sm:px-4"
            >
              {t('listings.next')}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="z-[9999]">
            <p>{t('listings.next_tooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

// Team Grid Component
const TeamGrid = ({ currentTeams, loadTeams }: {
  currentTeams: any[];
  loadTeams: () => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
    {currentTeams.map((team, index) => (
      <motion.div
        key={team.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        className="relative z-10"
      >
        <TeamCardFixed team={team} loadTeams={loadTeams} />
      </motion.div>
    ))}
  </div>
);

// Team Card Component (Fixed tooltip overflow)
const TeamCardFixed = ({ team, loadTeams }: { team: any; loadTeams: () => void }) => {
  return (
    <div className="relative">
      <TeamCard team={team} onUpdate={loadTeams} />
    </div>
  );
};

// Main Listings Component
const Listings = () => {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMajor, setFilterMajor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOffline, setIsOffline] = useState(false);

  const loadTeams = async () => {
    try {
      const teamData = await getTeamRequests();
      setTeams(teamData);
      setFilteredTeams(teamData);
      setIsOffline(!navigator.onLine);
    } catch (error) {
      console.error("Failed to load teams:", error);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
    
    const unsubscribe = subscribeToListingsUpdates((event) => {
      if (event.data.type === 'LISTINGS_UPDATED') {
        loadTeams();
      }
    });
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.user_abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some((member: any) => 
          member.tech_field.some((field: string) => 
            field.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          member.planguage.some((lang: string) => 
            lang.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }

    if (filterMajor !== "all") {
      filtered = filtered.filter(team => 
        team.members.some((member: any) => member.major === filterMajor)
      );
    }

    setFilteredTeams(filtered);
    setCurrentPage(1);
  }, [teams, searchTerm, filterMajor]);

  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTeams = filteredTeams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        <div className="relative z-0">
          <Navbar />
          
          <OfflineAlert isOffline={isOffline} t={t} />
          <ListingsHeader t={t} />
          <FiltersSection 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterMajor={filterMajor}
            setFilterMajor={setFilterMajor}
            filteredTeams={filteredTeams}
            t={t}
          />

          {/* Team Listings */}
          <section className="py-8 sm:py-12 px-3 sm:px-4">
            <div className="container mx-auto max-w-7xl">
              {loading ? (
                <LoadingSkeleton />
              ) : filteredTeams.length === 0 ? (
                <EmptyState searchTerm={searchTerm} filterMajor={filterMajor} t={t} />
              ) : (
                <>
                  <TeamGrid currentTeams={currentTeams} loadTeams={loadTeams} />
                  <Pagination 
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    t={t}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default Listings;