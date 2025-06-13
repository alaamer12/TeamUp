
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import TeamCard from "../components/TeamCard";
import { getTeamRequests, subscribeToListingsUpdates } from "../utils/db";

const ITEMS_PER_PAGE = 6;

const Listings = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMajor, setFilterMajor] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadTeams = async () => {
    try {
      const teamData = await getTeamRequests();
      setTeams(teamData);
      setFilteredTeams(teamData);
    } catch (error) {
      console.error("Failed to load teams:", error);
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

    return unsubscribe;
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
    "Computer Science", "Software Engineering", "Information Technology", 
    "Data Science", "Computer Engineering", "Electrical Engineering", 
    "Mathematics", "Physics", "Business", "Design", "Other"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
            
            <Link to="/">
              <Button className="gradient-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Team Request
              </Button>
            </Link>
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
                <Input
                  placeholder="Search teams, skills, languages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
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
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
              </div>
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
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-10"
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Listings;
