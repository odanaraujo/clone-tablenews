import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';

// Categorias disponíveis com labels em português
const CATEGORIES = {
  home: { label: 'Home', icon: '🏠' },
  world: { label: 'Mundo', icon: '🌍' },
  politics: { label: 'Política', icon: '🏛️' },
  business: { label: 'Negócios', icon: '💼' },
  tech: { label: 'Tecnologia', icon: '💻' },
  science: { label: 'Ciência', icon: '🔬' },
  sports: { label: 'Esportes', icon: '⚽' }
};

// Hook personalizado para buscar notícias
function useNews(category, sortBy) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/news?category=${category}&limit=20&sort=${sortBy}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar notícias');
      }
      
      if (data.success) {
        setNews(data.data || []);
        setLastFetch(new Date());
      } else {
        throw new Error(data.error || 'Resposta inválida da API');
      }
      
    } catch (err) {
      console.error('Erro ao buscar notícias:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, sortBy]);

  // Buscar notícias ao montar o componente e quando categoria/ordenação mudar
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Auto-refresh a cada hora
  useEffect(() => {
    const interval = setInterval(fetchNews, 60 * 60 * 1000); // 1 hora
    return () => clearInterval(interval);
  }, [fetchNews]);

  return { news, loading, error, refetch: fetchNews, lastFetch };
}

function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'relevant'
  const [currentCategory, setCurrentCategory] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hook para buscar notícias da categoria atual
  const { news, loading, error, refetch, lastFetch } = useNews(currentCategory, sortBy);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    // Google Analytics - Rastrear mudança de tema
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_toggle', {
        event_category: 'ui_interaction',
        event_label: newMode ? 'dark' : 'light'
      });
    }
  };

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setMobileMenuOpen(false); // Fechar menu mobile ao selecionar categoria
    
    // Google Analytics - Rastrear mudança de categoria
    if (typeof gtag !== 'undefined') {
      gtag('event', 'category_change', {
        event_category: 'navigation',
        event_label: category,
        custom_parameter: CATEGORIES[category]?.label
      });
    }
  };

  const formatLastUpdate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `há ${hours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-620LEXVFHC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-620LEXVFHC');
            `,
          }}
        />
        
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OnlyDans - Top Stories</title>
        <meta name="description" content="The most important news of the day, with short summaries and reference links." />
        <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" 
          rel="stylesheet" 
        />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script 
          id="tailwind-config"
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      primary: '#1173d4',
                      'background-light': '#f6f7f8',
                      'background-dark': '#101922',
                    },
                    fontFamily: {
                      display: ['newsreader'],
                    },
                    borderRadius: {
                      DEFAULT: 'rounded-md',
                    },
                  },
                },
              };
            `
          }}
        />
        <style jsx>{`
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </Head>
      
      <div className={`${darkMode ? 'dark' : ''}`}>
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-slate-200">
          <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-background-light/80 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/80">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                  <a className="flex items-center gap-3 py-4" href="#">
                    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
                      <path clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" fillRule="evenodd"></path>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">OnlyDans</h1>
                  </a>
                </div>
                <nav className="hidden items-center gap-x-8 text-sm font-medium lg:flex">
                  {Object.entries(CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleCategoryChange(key)}
                      className={`transition-colors ${
                        currentCategory === key
                          ? 'text-primary font-semibold'
                          : 'text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary'
                      }`}
                    >
                      <span className="hidden xl:inline mr-1">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </nav>
                <div className="flex items-center gap-4">
                  <button 
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 lg:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    {darkMode ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>
                  <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKtitAUyxDoHMu_fTSvTB3TX16BZvGd-FL9s1NMMCq2OpdywbwWnmRy8dMqAVXy95qZ0GngbY-E7E5ElQo5CWr01kkTyYePU1s4xY208IvbA7iYHIwf5xlqXmUVfq5Q3VaeOqwWJciSdBqSxMI7Tft41EFfzwhsGWhp2pJZ-3NrsaxeH5ljJTZRsDyQyi7f0FNIDHTWes-OEqxcHRf-wwCo6Xeh_-YjcYShJlqCfczm4n8gG9Ho0ETeb9oUkKmGf6VSeplAJ6IT2Q)"'}}></div>
                </div>
              </div>
              
              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <div className="border-t border-slate-200/80 bg-background-light/95 backdrop-blur-sm dark:border-slate-800/80 dark:bg-background-dark/95 lg:hidden">
                  <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <button
                          key={key}
                          onClick={() => handleCategoryChange(key)}
                          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            currentCategory === key
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {category.icon} {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="space-y-12">
                  <div className="space-y-4 border-b border-slate-200/80 pb-8 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                          {CATEGORIES[currentCategory]?.label}
                        </h2>
                        {lastFetch && (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Última atualização: {formatLastUpdate(lastFetch)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={refetch}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <svg 
                          className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {loading ? 'Atualizando...' : 'Atualizar'}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                          sortBy === 'recent' 
                            ? 'bg-primary text-white hover:bg-primary/80' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setSortBy('recent')}
                      >
                        📅 Mais Recentes
                      </button>
                      <button 
                        className={`rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
                          sortBy === 'relevant' 
                            ? 'bg-primary text-white hover:bg-primary/80' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                        onClick={() => setSortBy('relevant')}
                      >
                        🔥 Mais Relevantes
                      </button>
                    </div>
                  </div>
                  
                  {/* Loading State */}
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                        <svg className="h-6 w-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Carregando notícias...</span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
                      <div className="flex items-center gap-3">
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-red-800 dark:text-red-200">
                            Erro ao carregar notícias
                          </h3>
                          <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
                          <button
                            onClick={refetch}
                            className="mt-3 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                          >
                            Tentar novamente
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News List */}
                  {!loading && !error && news.length > 0 && (
                    <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                      {news.map((article) => (
                        <article key={article.id} className="flex gap-6 py-8">
                          <div className="h-24 w-32 flex-shrink-0 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-2">
                            <a 
                              className="group" 
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                // Google Analytics - Rastrear cliques em notícias
                                if (typeof gtag !== 'undefined') {
                                  gtag('event', 'news_click', {
                                    event_category: 'engagement',
                                    event_label: article.source,
                                    custom_parameter: currentCategory
                                  });
                                }
                              }}
                            >
                              <h3 className="text-xl font-semibold text-slate-900 group-hover:text-primary dark:text-white dark:group-hover:text-primary">
                                {article.title}
                              </h3>
                            </a>
                            <p className="line-clamp-3 text-base text-slate-600 dark:text-slate-400">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between">
                              <a 
                                className="text-sm font-medium text-primary hover:underline dark:text-primary" 
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  // Google Analytics - Rastrear cliques em "Ler mais"
                                  if (typeof gtag !== 'undefined') {
                                    gtag('event', 'read_more_click', {
                                      event_category: 'engagement',
                                      event_label: article.source,
                                      custom_parameter: currentCategory
                                    });
                                  }
                                }}
                              >
                                Ler mais em {article.source}
                              </a>
                              {sortBy === 'relevant' && (
                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                  {article.relevance}% relevante
                                </span>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !error && news.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <svg className="h-16 w-16 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Nenhuma notícia encontrada
                      </h3>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Não há notícias disponíveis nesta categoria no momento.
                      </p>
                      <button
                        onClick={refetch}
                        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-background-light dark:bg-background-dark">
              <div className="mx-auto max-w-7xl border-t border-slate-200/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800/80 dark:text-slate-400 sm:px-6 lg:px-8">
                <p>© 2024 OnlyDans. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
