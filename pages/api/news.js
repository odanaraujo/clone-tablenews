// GNews API Configuration
const GNEWS_API_KEY = '8c34d987f002aca02aad2daf5811b9bd';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

// Configurações de queries da GNews por categoria
const GNEWS_QUERIES = {
  home: {
    endpoint: 'top-headlines',
    params: 'category=general&lang=pt&country=br&nullable=image'
  },
  world: {
    endpoint: 'top-headlines', 
    params: 'category=world&lang=pt&country=br&nullable=image'
  },
  politics: {
    endpoint: 'search',
    params: 'q=política OR governo OR eleição OR congresso OR ministério&lang=pt&country=br&nullable=image&sortby=publishedAt'
  },
  business: {
    endpoint: 'top-headlines',
    params: 'category=business&lang=pt&country=br&nullable=image'
  },
  tech: {
    endpoint: 'top-headlines',
    params: 'category=technology&lang=pt&country=br&nullable=image'
  },
  science: {
    endpoint: 'top-headlines',
    params: 'category=science&lang=pt&country=br&nullable=image'
  },
  sports: {
    endpoint: 'top-headlines',
    params: 'category=sports&lang=pt&country=br&nullable=image'
  }
};

// Cache simples em memória (em produção, usar Redis ou similar)
let newsCache = {};

// Cache otimizado para GNews (limite não especificado, mas vamos ser conservadores)
const CACHE_DURATIONS = {
  home: 2 * 60 * 60 * 1000,      // 2 horas (categoria mais popular)
  world: 4 * 60 * 60 * 1000,     // 4 horas  
  politics: 2 * 60 * 60 * 1000,  // 2 horas (notícias quentes)
  business: 4 * 60 * 60 * 1000,  // 4 horas
  tech: 6 * 60 * 60 * 1000,      // 6 horas
  science: 8 * 60 * 60 * 1000,   // 8 horas (menos urgente)
  sports: 3 * 60 * 60 * 1000     // 3 horas (resultados frequentes)
};

// Contador de requests para monitorar uso da API
let requestCount = { count: 0, date: new Date().toDateString() };

// Função para calcular score de relevância baseado em palavras-chave importantes
function calculateRelevance(title, description) {
  const keywords = {
    high: ['brasil', 'governo', 'economia', 'eleição', 'presidente', 'ministro', 'congresso', 'supremo', 'stf'],
    medium: ['política', 'negócios', 'mercado', 'empresa', 'tecnologia', 'saúde', 'educação'],
    low: ['local', 'regional', 'municipal', 'estado']
  };
  
  let score = 50; // Score base
  const text = `${title} ${description}`.toLowerCase();
  
  keywords.high.forEach(keyword => {
    if (text.includes(keyword)) score += 15;
  });
  
  keywords.medium.forEach(keyword => {
    if (text.includes(keyword)) score += 10;
  });
  
  keywords.low.forEach(keyword => {
    if (text.includes(keyword)) score += 5;
  });
  
  return Math.min(100, Math.max(1, score));
}

// Função para limpar texto HTML/CDATA
function cleanText(text) {
  if (!text) return '';
  
  // Remove HTML tags mas preserva espaços
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Tratar sequências específicas que causam palavras juntas
  text = text
    .replace(/([A-Za-zÀ-ÿ0-9])&nbsp;&nbsp;([A-ZÀ-Ÿ])/g, '$1. $2')
    .replace(/(Estadão|UOL|G1|Globo|Folha)([A-Z][a-z]{3,})/g, '$1. $2')
    .replace(/(CNN|BBC)([A-Z][a-z]{3,})/g, '$1 $2')
    .replace(/([a-z]+)([0-9]{3})([A-Z][a-z]{3,})/g, '$1 $2. $3')
    .replace(/(\d)(G1|UOL|CNN|BBC|Globo)/g, '$1. $2');
  
  // Decodifica entidades HTML comuns
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  // Limpeza final de espaços
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return text;
}

// Função para extrair domínio da fonte
function extractDomain(url) {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
}

// Função para monitorar uso de requests da API
function trackAPIRequest() {
  const today = new Date().toDateString();
  
  if (requestCount.date !== today) {
    requestCount = { count: 1, date: today };
  } else {
    requestCount.count++;
  }
  
  console.log(`GNews Request #${requestCount.count} today`);
  
  if (requestCount.count >= 90) {
    console.warn('⚠️ High number of GNews requests today!');
  }
  
  return requestCount;
}

// Função para processar artigo da GNews em formato JSON
function processGNewsArticle(article, index) {
  const title = cleanText(article.title || '');
  const description = cleanText(article.description || '');
  
  // Usar description para summary
  let summary = description;
  if (summary) {
    summary = summary.substring(0, 300) + (summary.length > 300 ? '...' : '');
  }
  
  // Extrair informações da fonte (GNews tem estrutura source.name)
  const sourceName = article.source?.name || extractDomain(article.url) || 'Fonte Desconhecida';
  const sourceUrl = article.source?.url || article.url || '';
  
  // Calcular relevância
  const relevance = calculateRelevance(title, summary);
  
  // Processar data de publicação
  let publishedAt = new Date();
  if (article.publishedAt) {
    try {
      publishedAt = new Date(article.publishedAt);
    } catch {
      publishedAt = new Date();
    }
  }
  
  // Imagem da GNews (com nullable=image deve sempre ter!)
  const imageUrl = article.image || null;
  
  return {
    id: article.id || `${index + 1}`,
    title,
    summary: summary || 'Resumo não disponível.',
    url: article.url || '',
    source: sourceName,
    sourceUrl,
    publishedAt: publishedAt.toISOString(),
    relevance,
    timestamp: publishedAt,
    imageUrl,
    author: null, // GNews não retorna author no resultado base
    originalId: article.id // ID original da GNews
  };
}

// Função principal para buscar e processar notícias da GNews
async function fetchNews(category = 'home', limit = 20) {
  const cacheKey = `${category}_${limit}`;
  const cacheDuration = CACHE_DURATIONS[category] || CACHE_DURATIONS.home;
  
  // Verificar cache
  if (newsCache[cacheKey] && 
      (Date.now() - newsCache[cacheKey].fetchedAt) < cacheDuration) {
    console.log(`Cache hit for ${category}`);
    return newsCache[cacheKey].data;
  }
  
  try {
    const queryConfig = GNEWS_QUERIES[category] || GNEWS_QUERIES.home;
    const url = `${GNEWS_BASE_URL}/${queryConfig.endpoint}?${queryConfig.params}&max=${Math.min(limit, 100)}&apikey=${GNEWS_API_KEY}`;
    
    console.log(`Fetching news from GNews: ${category}`);
    console.log(`URL: ${url}`);
    
    // Monitorar uso da API
    trackAPIRequest();
    
    // Buscar da GNews
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OnlyDans/1.0; +https://onlydans.vercel.app)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`GNews error: ${data.error || 'Unknown error'}`);
    }
    
    const articles = data.articles || [];
    
    // Processar artigos
    const news = articles
      .slice(0, limit)
      .map((article, index) => processGNewsArticle(article, index))
      .filter(item => item.title && item.title.length > 10); // Filtrar títulos muito curtos
    
    // Salvar no cache
    newsCache[cacheKey] = {
      data: news,
      fetchedAt: Date.now(),
      totalArticles: data.totalArticles || articles.length
    };
    
    console.log(`Successfully processed ${news.length} news items for category: ${category}`);
    console.log(`Total articles available: ${data.totalArticles || 'unknown'}`);
    console.log(`GNews requests today: ${requestCount.count}`);
    
    return news;
    
  } catch (error) {
    console.error('Error fetching news from GNews:', error);
    
    // Retornar cache antigo em caso de erro, se existir
    if (newsCache[cacheKey]) {
      console.log('Returning cached data due to error');
      return newsCache[cacheKey].data;
    }
    
    throw new Error(`Falha ao buscar notícias: ${error.message}`);
  }
}

// Handler da API
export default async function handler(req, res) {
  // Apenas GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { category = 'home', limit = 20, sort = 'recent' } = req.query;
    
    // Validar categoria
    if (!GNEWS_QUERIES[category]) {
      return res.status(400).json({ error: 'Categoria inválida' });
    }
    
    // Validar limit
    const newsLimit = Math.min(parseInt(limit) || 20, 50); // Max 50 notícias
    
    // Buscar notícias
    let news = await fetchNews(category, newsLimit);
    
    // Aplicar ordenação
    if (sort === 'relevant') {
      news = news.sort((a, b) => b.relevance - a.relevance);
    } else {
      // Por padrão, ordenar por data (mais recente primeiro)
      news = news.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    }
    
    // Remover timestamp (usado apenas para ordenação)
    news = news.map(({ timestamp, ...item }) => item);
    
    // Resposta de sucesso
    res.status(200).json({
      success: true,
      category,
      total: news.length,
      data: news,
      cached: newsCache[`${category}_${newsLimit}`]?.fetchedAt ? true : false,
      fetchedAt: new Date().toISOString(),
      apiUsage: `${requestCount.count} requests today`
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      fetchedAt: new Date().toISOString(),
      apiUsage: `${requestCount.count} requests today`
    });
  }
}