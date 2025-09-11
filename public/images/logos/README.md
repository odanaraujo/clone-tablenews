# OnlyDans Logos

Esta pasta contém os logos e assets visuais do OnlyDans.

## Estrutura recomendada:

### Logos principais:
- `onlydans-logo.svg` - Logo principal (horizontal)
- `onlydans-logo.png` - Versão PNG do logo principal
- `onlydans-icon.svg` - Ícone isolado (para favicon)
- `onlydans-icon.png` - Versão PNG do ícone

### Variações:
- `onlydans-logo-light.svg` - Versão para fundo escuro
- `onlydans-logo-dark.svg` - Versão para fundo claro
- `onlydans-logo-horizontal.svg` - Versão horizontal expandida
- `onlydans-logo-vertical.svg` - Versão vertical (se necessário)

### Favicons:
- `favicon.ico` - Favicon tradicional
- `favicon-16x16.png` - Favicon pequeno
- `favicon-32x32.png` - Favicon médio
- `apple-touch-icon.png` - Ícone para iOS

## Uso no código:

```jsx
// No React/Next.js
<img src="/images/logos/onlydans-logo.svg" alt="OnlyDans" />

// Como favicon (no Head)
<link rel="icon" href="/images/logos/favicon.ico" />
```

## Especificações técnicas:
- **Logo horizontal**: ~240x60px ideal para header
- **Ícone quadrado**: 64x64px, 128x128px, 256x256px
- **Cores**: Primária #1173d4, tons de slate gray
- **Formatos**: SVG (preferível), PNG com transparência
