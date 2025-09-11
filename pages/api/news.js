import { XMLParser } from 'fast-xml-parser';

// Configurações dos feeds RSS do Google News por categoria
const RSS_FEEDS = {
  home: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419',
  world: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=pt-BR&gl=BR&ceid=BR:pt-419',
  politics: 'https://news.google.com/rss/search?q=pol%C3%ADtica+Brasil&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  business: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=pt-BR&gl=BR&ceid=BR:pt-419',
  tech: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=pt-BR&gl=BR&ceid=BR:pt-419',
  science: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=pt-BR&gl=BR&ceid=BR:pt-419',
  sports: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=pt-BR&gl=BR&ceid=BR:pt-419'
};

// Cache simples em memória (em produção, usar Redis ou similar)
let newsCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora em milissegundos

// Parser XML otimizado
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  ignoreNameSpace: false,
  alwaysCreateTextNode: false
});

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
  
  // Bonus para notícias recentes (últimas 6 horas)
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  
  return Math.min(100, Math.max(1, score));
}

// Função para limpar texto HTML/CDATA
function cleanText(text) {
  if (!text) return '';
  
  // Remove CDATA
  text = text.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
  
  // Remove HTML tags mas preserva espaços
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Tratar sequências específicas do Google News que causam palavras juntas
  // Foco apenas em padrões conhecidos de fontes de notícias brasileiras
  text = text
    .replace(/([A-Za-zÀ-ÿ0-9])&nbsp;&nbsp;([A-ZÀ-Ÿ])/g, '$1. $2')  // Separador específico do Google News
    // Padrões específicos de fontes conhecidas
    .replace(/(Estadão|UOL|G1|Globo|Folha)([A-Z][a-z]{3,})/g, '$1. $2')  // Ex: "EstadãoFux", "G1Luiz"
    .replace(/(CNN|BBC)([A-Z][a-z]{3,})/g, '$1 $2')                      // Ex: "CNNBrasil"
    .replace(/([a-z]+)([0-9]{3})([A-Z][a-z]{3,})/g, '$1 $2. $3')         // Ex: "Poder360Fux"
    .replace(/(\d)(G1|UOL|CNN|BBC|Globo)/g, '$1. $2');                   // Ex: "360G1"
  
  // Decodifica entidades HTML comuns
  text = text
    .replace(/&nbsp;/g, ' ')           // Non-breaking space
    .replace(/&amp;/g, '&')           // Ampersand
    .replace(/&lt;/g, '<')            // Less than
    .replace(/&gt;/g, '>')            // Greater than
    .replace(/&quot;/g, '"')          // Double quote
    .replace(/&#39;/g, "'")           // Single quote
    .replace(/&apos;/g, "'")          // Apostrophe
    .replace(/&hellip;/g, '...')      // Ellipsis
    .replace(/&mdash;/g, '—')         // Em dash
    .replace(/&ndash;/g, '–')         // En dash
    .replace(/&rsquo;/g, "'")         // Right single quote
    .replace(/&lsquo;/g, "'")         // Left single quote
    .replace(/&rdquo;/g, '"')         // Right double quote
    .replace(/&ldquo;/g, '"')         // Left double quote
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))  // Numeric entities
    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16))); // Hex entities
  
  // Limpeza final de espaços
  text = text
    .replace(/\s+/g, ' ')             // Multiple spaces to single space
    .replace(/\.\s*\./g, '.')         // Remove pontos duplos
    .replace(/\n\s*\n/g, '\n')        // Multiple line breaks
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

// Função para processar item RSS em formato JSON
function processRSSItem(item, index) {
  const title = cleanText(item.title || '');
  const description = cleanText(item.description || '');
  const link = item.link || '';
  const pubDate = item.pubDate || item.published || '';
  
  // Extrair informações da fonte
  const source = item.source || {};
  const sourceName = cleanText(source.text || extractDomain(link));
  const sourceUrl = source.url || link;
  
  // Calcular relevância
  const relevance = calculateRelevance(title, description);
  
  // Processar data de publicação
  let publishedAt = new Date();
  if (pubDate) {
    try {
      publishedAt = new Date(pubDate);
    } catch {
      publishedAt = new Date();
    }
  }
  
  return {
    id: index + 1,
    title,
    summary: description.substring(0, 300) + (description.length > 300 ? '...' : ''),
    url: link,
    source: sourceName || 'Fonte Desconhecida',
    sourceUrl,
    publishedAt: publishedAt.toISOString(),
    relevance,
    timestamp: publishedAt
  };
}

// Função principal para buscar e processar notícias
async function fetchNews(category = 'home', limit = 20) {
  const cacheKey = `${category}_${limit}`;
  
  // Verificar cache
  if (newsCache[cacheKey] && 
      (Date.now() - newsCache[cacheKey].fetchedAt) < CACHE_DURATION) {
    return newsCache[cacheKey].data;
  }
  
  try {
    const rssUrl = RSS_FEEDS[category] || RSS_FEEDS.home;
    
    console.log(`Fetching news from: ${rssUrl}`);
    
    // Buscar RSS feed
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OnlyDans/1.0; +https://onlydans.vercel.app)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlData = await response.text();
    
    // Parse XML
    const parsed = parser.parse(xmlData);
    
    // Extrair items do RSS
    const rss = parsed.rss || parsed;
    const channel = rss.channel || rss;
    let items = channel.item || channel.items || [];
    
    // Garantir que items é um array
    if (!Array.isArray(items)) {
      items = [items];
    }
    
    // Processar items
    const news = items
      .slice(0, limit)
      .map((item, index) => processRSSItem(item, index))
      .filter(item => item.title && item.title.length > 10); // Filtrar títulos muito curtos
    
    // Salvar no cache
    newsCache[cacheKey] = {
      data: news,
      fetchedAt: Date.now()
    };
    
    console.log(`Successfully processed ${news.length} news items for category: ${category}`);
    
    return news;
    
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Retornar cache antigo em caso de erro, se existir
    if (newsCache[cacheKey]) {
      console.log('Returning cached data due to error');
      return newsCache[cacheKey] .data;
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
    if (!RSS_FEEDS[category]) {
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
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      fetchedAt: new Date().toISOString()
    });
  }
}
