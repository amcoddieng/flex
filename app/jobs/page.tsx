"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JobCard, type Job } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, Briefcase, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Type definition for API jobs
type APIJob = {
  id: number;
  title: string;
  location: string;
  is_active: boolean;
  blocked: boolean;
  posted_at: string;
  applicants?: number;
  description?: string;
  company?: string;
  service_type?: string;
  salary?: string;
  availability?: any;
  type_paiement?: string;
  requirements?: string;
  contact_email?: string;
  contact_phone?: string;
  updated_at?: string;
};

// Transform API job to UI Job format
const transformAPIJobToUI = (apiJob: APIJob): Job => {
  return {
    id: String(apiJob.id),
    title: apiJob.title,
    company: apiJob.company || "Entreprise",
    location: apiJob.location,
    salary: apiJob.salary || "À discuter",
    type: apiJob.type_paiement === "heure" ? "part-time" : "full-time",
    category: apiJob.service_type || "Général",
    postedAt: new Date(apiJob.posted_at).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    description: apiJob.description || "",
    urgent: apiJob.is_active && !apiJob.blocked,
  };
};

// Sample jobs data - keeping for reference
const jobsData: Job[] = [
  {
    id: "1",
    title: "Developpeur Web Junior",
    company: "Tech Solutions Dakar",
    location: "Dakar, Senegal",
    salary: "150 000 - 200 000 FCFA/mois",
    type: "part-time",
    category: "Informatique",
    postedAt: "Il y a 2 heures",
    description:
      "Nous recherchons un developpeur web junior pour rejoindre notre equipe. Vous travaillerez sur des projets web modernes utilisant React et Node.js.",
    urgent: true,
  },
  {
    id: "2",
    title: "Assistant Marketing Digital",
    company: "Agence Creative",
    location: "Dakar, Senegal",
    salary: "100 000 - 150 000 FCFA/mois",
    type: "part-time",
    category: "Marketing",
    postedAt: "Il y a 5 heures",
    description:
      "Participez a la gestion des reseaux sociaux et aux campagnes marketing digital de nos clients. Formation assuree.",
  },
  {
    id: "3",
    title: "Serveur/Serveuse - Weekend",
    company: "Restaurant Le Terrou-Bi",
    location: "Dakar, Senegal",
    salary: "5 000 FCFA/jour + pourboires",
    type: "part-time",
    category: "Restauration",
    postedAt: "Il y a 1 jour",
    description:
      "Nous recherchons des serveurs dynamiques pour les weekends. Ambiance conviviale et tips genereux.",
  },
  {
    id: "4",
    title: "Stage Ressources Humaines",
    company: "Groupe Sonatel",
    location: "Dakar, Senegal",
    salary: "75 000 FCFA/mois",
    type: "internship",
    category: "RH",
    postedAt: "Il y a 2 jours",
    description:
      "Stage de 3 mois au sein du departement RH. Opportunite d'apprendre aupres de professionnels experimentes.",
    urgent: true,
  },
  {
    id: "5",
    title: "Community Manager Freelance",
    company: "Startup SenTech",
    location: "Remote",
    salary: "80 000 - 120 000 FCFA/mois",
    type: "freelance",
    category: "Marketing",
    postedAt: "Il y a 3 jours",
    description:
      "Gerez les reseaux sociaux de notre startup. Horaires flexibles et possibilite de travail a distance.",
  },
  {
    id: "6",
    title: "Livreur a Velo",
    company: "Jumia Food",
    location: "Dakar, Senegal",
    salary: "2 500 FCFA/livraison",
    type: "freelance",
    category: "Livraison",
    postedAt: "Il y a 3 jours",
    description:
      "Livrez des repas en velo dans Dakar. Travaillez quand vous voulez et gagnez par livraison.",
  },
  {
    id: "7",
    title: "Tuteur en Mathematiques",
    company: "Centre d'Excellence",
    location: "Saint-Louis, Senegal",
    salary: "10 000 FCFA/heure",
    type: "part-time",
    category: "Education",
    postedAt: "Il y a 4 jours",
    description:
      "Donnez des cours particuliers de mathematiques aux eleves du secondaire. Niveau bac+2 minimum requis.",
  },
  {
    id: "8",
    title: "Designer Graphique",
    company: "Agence Pixel",
    location: "Dakar, Senegal",
    salary: "120 000 - 180 000 FCFA/mois",
    type: "full-time",
    category: "Design",
    postedAt: "Il y a 5 jours",
    description:
      "Creez des visuels pour nos clients. Maitrise de la suite Adobe requise. Portfolio demande.",
  },
];

export default function JobsPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleJobs, setVisibleJobs] = useState<Set<number>>(new Set());
  const [searchFocused, setSearchFocused] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const jobsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  /**
   * Helper: Get the current valid token from localStorage (if exists)
   * Returns null if no token
   */
  const getValidToken = (): string | null => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token) return null;

    // Decode to verify it's valid
    const decoded = decodeToken(token);
    if (!decoded) {
      localStorage.removeItem("token");
      return null;
    }

    return token;
  };

  /**
   * Initialize and fetch jobs on mount
   */
  useEffect(() => {
    setIsPageLoaded(true);
    fetchJobs(1);
  }, []);

  /**
   * Fetch jobs from API
   */
  const fetchJobs = async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = getValidToken();

      // Build query URL with pagination and search
      let url = `/api/job?page=${pageNum}&limit=${limit}`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Make request - optional Authorization header
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!res.ok) {
        let errorMsg = "Erreur lors de la récupération des offres";

        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          if (res.status === 500) {
            errorMsg = "Erreur serveur. Veuillez réessayer.";
          }
        }

        throw new Error(errorMsg);
      }

      const data = await res.json();

      // Transform API jobs to UI format
      const transformedJobs = (data.data || []).map(transformAPIJobToUI);
      setJobs(transformedJobs);
      setTotal(data.pagination?.total || 0);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
      // Fallback to sample data if API fails
      setJobs(jobsData);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when search query changes
  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [searchQuery]);

  // Extract unique categories from jobs
  const categories = [
    "Tous",
    ...Array.from(new Set(jobs.map((job) => job.category))).sort(),
  ];

  const types = [
    { value: "all", label: "Tous les types" },
    { value: "full-time", label: "Temps plein" },
    { value: "part-time", label: "Temps partiel" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Stage" },
  ];

  const locations = [
    { value: "all", label: "Toutes les villes" },
    { value: "dakar", label: "Dakar" },
    { value: "saint-louis", label: "Saint-Louis" },
    { value: "thies", label: "Thies" },
    { value: "remote", label: "Remote" },
  ];

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Tous" || job.category === selectedCategory;

    const matchesType = selectedType === "all" || job.type === selectedType;

    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "remote" &&
        job.location.toLowerCase().includes("remote")) ||
      job.location.toLowerCase().includes(selectedLocation);

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  // Animate jobs on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleJobs((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    const jobCards = jobsRef.current?.querySelectorAll("[data-index]");
    jobCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredJobs]);

  // Reset visible jobs when filters change
  useEffect(() => {
    setVisibleJobs(new Set());
    const timer = setTimeout(() => {
      filteredJobs.forEach((_, index) => {
        setTimeout(() => {
          setVisibleJobs((prev) => new Set([...prev, index]));
        }, index * 100);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [filteredJobs.length, searchQuery, selectedCategory, selectedType, selectedLocation]);

  const activeFiltersCount = [
    selectedCategory !== "Tous",
    selectedType !== "all",
    selectedLocation !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("Tous");
    setSelectedType("all");
    setSelectedLocation("all");
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with animations */}
      <section className="pt-28 pb-12 bg-muted/30 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div 
            className={`max-w-3xl mx-auto text-center mb-10 transition-all duration-700 ${
              isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 animate-pulse" />
              {loading ? "Chargement..." : `${filteredJobs.length} offres disponibles`}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              Trouvez votre prochain{" "}
              <span className="relative inline-block">
                <span className="text-primary">job etudiant</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,6 Q50,0 100,6 T200,6" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary/30" />
                </svg>
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Des opportunites adaptees a votre emploi du temps
            </p>
          </div>

          {/* Search Bar with glow effect */}
          <div 
            className={`max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className={`relative transition-all duration-300 ${searchFocused ? "scale-[1.02]" : ""}`}>
              <div className={`absolute -inset-1 bg-primary/20 rounded-2xl blur-lg transition-opacity duration-300 ${searchFocused ? "opacity-100" : "opacity-0"}`} />
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${searchFocused ? "text-primary" : "text-muted-foreground"}`} />
                <Input
                  type="text"
                  placeholder="Rechercher un job, une entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="h-14 pl-12 pr-4 text-base rounded-xl border-2 border-border focus:border-primary shadow-lg shadow-primary/5 bg-card"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-300",
                    showFilters && "bg-primary/10 text-primary"
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-pulse">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Filters panel with animation */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-out",
                showFilters ? "max-h-96 opacity-100 mt-6" : "max-h-0 opacity-0"
              )}
            >
              <div className="bg-card rounded-2xl p-6 border border-border shadow-xl shadow-primary/5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type de contrat</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Localisation</label>
                    <Select
                      value={selectedLocation}
                      onValueChange={setSelectedLocation}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {activeFiltersCount} filtre(s) actif(s)
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:text-destructive">
                      <X className="h-4 w-4 mr-2" />
                      Reinitialiser
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills with scroll animation */}
      <section className="py-6 border-b border-border bg-background sticky top-[73px] z-40 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-105",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-lg text-destructive">
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">Affichage des données en cache...</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Chargement des offres...</h3>
              <p className="text-muted-foreground">Veuillez patienter</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div
              ref={jobsRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredJobs.map((job, index) => (
                <div key={job.id} data-index={index}>
                  <JobCard
                    job={job}
                    index={index}
                    isVisible={visibleJobs.has(index)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Aucune offre trouvee</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Essayez de modifier vos criteres de recherche pour trouver plus d'opportunites
              </p>
              <Button onClick={() => { setSelectedCategory("Tous"); setSelectedType("all"); setSelectedLocation("all"); setSearchQuery(""); }} size="lg" className="shadow-xl shadow-primary/25">
                Reinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Load More */}
          {filteredJobs.length > 0 && total > limit * page && (
            <div className="text-center mt-12">
              <Button 
                onClick={() => fetchJobs(page + 1)}
                variant="outline" 
                size="lg" 
                className="px-8 bg-transparent hover:bg-primary/5 hover:border-primary hover:scale-105 transition-all duration-300"
              >
                Charger plus d{"'"}offres
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
