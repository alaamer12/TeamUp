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

const ITEMS_PER_PAGE = 6;

const Listings = () => {
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
            <AlertTitle>Offline Mode</AlertTitle>
            <AlertDescription>
              You're currently in offline mode. Changes will be saved locally and synced when you reconnect.
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
              <h1 className="text-4xl font-bold mb-4">Team Requests</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Browse and join amazing teams looking for talented members
              </p>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <Button className="gradient-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Team Request
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create your own team request to find collaborators</p>
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
                        placeholder="Search teams, skills, languages..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Search by skills, languages, or team descriptions</p>
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
                          <SelectValue placeholder="Filter by major" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Majors</SelectItem>
                          {majors.map((major) => (
                            <SelectItem key={major} value={major}>{major}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Filter teams by academic major (CS: Computer Science, IS: Information Systems, SC: Scientific Computing, AI: Artificial Intelligence)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-sm text-muted-foreground">
                      {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of teams matching your current filters</p>
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
                <h3 className="text-2xl font-semibold mb-2">No teams found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterMajor !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Be the first to create a team request!"
                  }
                </p>
                <Link to="/">
                  <Button className="gradient-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team Request
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
                      transition={{ delay: index * 0.1 }}
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
                            Previous
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Go to previous page</p>
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
                            <p>Go to page {i + 1}</p>
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
                            Next
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Go to next page</p>
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
