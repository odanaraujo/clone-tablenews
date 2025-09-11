# OnlyDans - MVP de Site de Notícias

## 🎯 Sobre o Projeto

OnlyDans é um site de notícias que mostra as notícias mais importantes do dia com resumos curtos e links de referência. Simples, rápido e útil — perfeito para validar se as pessoas gostam e voltam.

## ✨ Funcionalidades Implementadas

### 🔄 **Integração Completa com Google News RSS**
- ✅ **API própria** (`/api/news`) que busca notícias reais do Google News
- ✅ **Parse XML → JSON** otimizado com cache de 1 hora
- ✅ **7 categorias** funcionais: Home, Mundo, Política, Negócios, Tecnologia, Ciência, Esportes
- ✅ **Notícias do Brasil** com filtros por categoria

### 🎛️ **Interface Moderna e Funcional**
- ✅ **Navegação dinâmica** entre categorias com ícones
- ✅ **Filtros inteligentes**: "Mais Recentes" / "Mais Relevantes" 
- ✅ **Sistema de relevância** baseado em palavras-chave importantes
- ✅ **Auto-refresh** a cada hora para notícias atualizadas
- ✅ **Loading states** e error handling robusto
- ✅ **Menu mobile** responsivo para todas as categorias

### 🎨 **UX/UI Otimizada**
- ✅ **Dark mode** completo com toggle
- ✅ **Estados visuais**: loading, error, empty state
- ✅ **Última atualização** visível com timestamps relativos
- ✅ **Botão de refresh** manual com feedback visual
- ✅ **Links externos** seguros (target="_blank" + rel="noopener")
- ✅ **Score de relevância** visível no modo "Mais Relevantes"

### 🔧 **Características Técnicas**
- ✅ **SEO básico** para aparecer no Google
- ✅ **Design responsivo** que funciona em mobile e desktop
- ✅ **Cache inteligente** para otimização de performance
- ✅ **Error boundaries** para recuperação de falhas
- ✅ **Google Analytics** completo com eventos customizados

### 📊 **Analytics e Rastreamento**
- ✅ **Google Analytics 4** integrado (ID: G-620LEXVFHC)
- ✅ **Eventos customizados** rastreados:
  - 📂 Mudança de categoria de notícias
  - 🖱️ Cliques em títulos de notícias
  - 📖 Cliques em "Ler mais"
  - 🌙 Toggle dark/light mode
- ✅ **Métricas de engajamento** para análise de comportamento
- ✅ **Fontes mais acessadas** para otimização de conteúdo

### 💰 **Monetização**
- ✅ **Google AdSense** integrado (ID: ca-pub-7415807447932383)
- ✅ **Script otimizado** para não afetar performance
- ✅ **Carregamento assíncrono** dos anúncios
- ✅ **Configuração de segurança** com crossOrigin
- ⏳ **Aguardando aprovação** do Google AdSense
- 🎯 **Pronto para exibir anúncios** após aprovação

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 13** - Framework React com App Router
- **React 18** - Biblioteca de UI com Hooks
- **Tailwind CSS** - Estilização via CDN
- **Font: Newsreader** - Tipografia elegante para notícias

### Backend/API
- **Next.js API Routes** - Backend integrado
- **fast-xml-parser** - Parser XML otimizado para RSS
- **Google News RSS** - Fonte de notícias gratuita
- **Cache em memória** - Otimização de performance

### Infraestrutura
- **Vercel** - Deploy e hosting
- **Git** - Controle de versão

## 📱 Funcionalidades de UX

- **Dark/Light Mode**: Toggle no header para alternar temas
- **Filtros Inteligentes**: 
  - Most Recent: Ordena por data/horário
  - Most Relevant: Ordena por score de relevância
- **Layout Responsivo**: Adapta para mobile, tablet e desktop
- **Hover Effects**: Interações visuais nos links e botões
- **Typography**: Fonte Newsreader otimizada para leitura

## 🎨 Design System

- **Cores primárias**: 
  - Primary: `#1173d4` (azul)
  - Background Light: `#f6f7f8` 
  - Background Dark: `#101922`
- **Tipografia**: Newsreader (Google Fonts)
- **Layout**: Max-width 4xl, espaçamentos consistentes

## 🔌 API Endpoints

### `GET /api/news`

Busca notícias do Google News RSS com cache de 1 hora.

**Parâmetros:**
- `category` (opcional): `home`, `world`, `politics`, `business`, `tech`, `science`, `sports`
- `limit` (opcional): número de notícias (máx: 50, padrão: 20)
- `sort` (opcional): `recent` (padrão) ou `relevant`

**Exemplo de uso:**
```javascript
// Buscar notícias de tecnologia, ordenadas por relevância
const response = await fetch('/api/news?category=tech&limit=10&sort=relevant');
const data = await response.json();

console.log(data.data); // Array de notícias
```

**Resposta:**
```json
{
  "success": true,
  "category": "tech",
  "total": 10,
  "data": [
    {
      "id": 1,
      "title": "Título da notícia",
      "summary": "Resumo da notícia...",
      "url": "https://fonte.com/noticia",
      "source": "Nome da Fonte",
      "sourceUrl": "https://fonte.com",
      "publishedAt": "2024-01-15T10:00:00Z",
      "relevance": 95
    }
  ],
  "cached": false,
  "fetchedAt": "2024-01-15T10:30:00Z"
}
```

## 📈 Próximos Passos (Roadmap)

### 🎯 **MVP v2.0**
- [ ] **Imagens das notícias**: Integrar com Web Scraping ou OpenGraph
- [ ] **Busca por notícias específicas**
- [ ] **Compartilhamento social**
- [ ] **PWA** (Progressive Web App)

### 📊 **Analytics & Engagement**
- [ ] **Newsletter/notificações push**
- [ ] **Sistema de favoritos**
- [ ] **Analytics de engajamento**
- [ ] **Comentários e interações**

### 🖼️ **Sobre Imagens das Notícias**
O Google News RSS não fornece imagens. Para implementar imagens, precisaremos:
1. **Web Scraping**: Buscar imagens das páginas originais
2. **OpenGraph**: Extrair meta tags `og:image`  
3. **APIs de terceiros**: Usar serviços como Linkpreview.net
4. **Fallback inteligente**: Placeholder temático por categoria

## 🚢 Deploy

Este projeto está pronto para deploy no Vercel, Netlify ou qualquer plataforma que suporte Next.js.

---

**© 2024 OnlyDans. MVP desenvolvido para validação rápida do produto.**
