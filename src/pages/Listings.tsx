import React, { useState, useEffect } from "react";
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
      
      // Check if we're offline based on network status
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
    
    // Subscribe to cross-tab updates
    const unsubscribe = subscribeToListingsUpdates((event) => {
      if (event.data.type === 'LISTINGS_UPDATED') {
        loadTeams();
      }
    });
    
    // Listen for online/offline events
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

    // Search filter
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

    // Major filter
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

  const majors = [
    "CS", "IS", "SC", "AI"
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Offline Mode Alert */}
        {isOffline && (
          <Alert className="mx-4 mt-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertTitle>{t('listings.offline_title')}</AlertTitle>
            <AlertDescription>
              {t('listings.offline_description')}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Header */}
        <section className="py-12 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">{t('listings.title')}</h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t('listings.subtitle')}
              </p>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button className="gradient-button">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('listings.create_button')}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('listings.create_tooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        placeholder={t('listings.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('listings.search_tooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select value={filterMajor} onValueChange={setFilterMajor}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder={t('listings.filter_major')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('listings.all_majors')}</SelectItem>
                          {majors.map((major) => (
                            <SelectItem key={major} value={major}>{major}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('listings.filter_tooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-muted-foreground">
                      {filteredTeams.length} {filteredTeams.length !== 1 ? t('listings.teams_count') : t('listings.teams_count_singular')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('listings.teams_count_tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </section>

        {/* Team Listings */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64"></div>
                  </div>
                ))}
              </div>
            ) : filteredTeams.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">{t('listings.no_teams_title')}</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterMajor !== "all" 
                    ? t('listings.no_teams_filters') 
                    : t('listings.no_teams_empty')
                  }
                </p>
                <Link to="/">
                  <Button className="gradient-button">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('listings.create_button')}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTeams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <TeamCard team={team} onUpdate={loadTeams} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                          >
                            {t('listings.previous')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('listings.previous_tooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={currentPage === i + 1 ? "default" : "outline"}
                              onClick={() => setCurrentPage(i + 1)}
                              className="w-10"
                            >
                              {i + 1}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('listings.page_tooltip')} {i + 1}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                          >
                            {t('listings.next')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('listings.next_tooltip')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default Listings;
