# ⚽ CalcioStats

Un'applicazione web moderna per visualizzare statistiche del calcio italiano, costruita con React, TypeScript e Vite.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)

## ✨ Funzionalità

- 🏆 **Campionati Italiani** - Visualizza tutti i campionati dalla Serie A alle serie minori
- 📊 **Classifiche** - Classifiche complete con statistiche dettagliate
- 📅 **Partite e Risultati** - Calendario partite e risultati passati
- ⚽ **Marcatori** - Classifica cannonieri con statistiche gol
- 👥 **Giocatori** - Database giocatori con dettagli e ruoli
- 🏟️ **Stadi** - Informazioni sui venue con link a Google Maps
- 🎯 **Dettagli Squadra** - Pagina dettagliata per ogni squadra con allenatore e stadio

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 con TypeScript
- **Bundler**: Vite 7
- **Styling**: TailwindCSS con design system custom
- **Animazioni**: Framer Motion
- **Icone**: Lucide React
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **API**: SoccersAPI

## 🚀 Installazione

### Prerequisiti

- Node.js 18+ 
- npm o yarn

### Setup

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd football-stats
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente**
   
   Crea un file `.env.local` nella root del progetto:
   ```env
   VITE_SOCCERSAPI_USER=tuo_username
   VITE_SOCCERSAPI_TOKEN=tuo_token
   ```
   
   > Ottieni le credenziali API registrandoti su [SoccersAPI](https://soccersapi.com)

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri nel browser**
   ```
   http://localhost:5173
   ```

## 📁 Struttura del Progetto

```
src/
├── api/              # Client API e funzioni fetch
│   ├── client.ts     # Configurazione Axios
│   └── football.ts   # Funzioni API (leagues, teams, fixtures, etc.)
├── components/       # Componenti React riutilizzabili
│   ├── Layout.tsx    # Layout principale con header/footer
│   └── LeagueSidebar.tsx
├── pages/            # Pagine dell'applicazione
│   ├── Home.tsx      # Homepage con lista campionati
│   ├── LeagueDetails.tsx  # Dettagli campionato
│   ├── TeamDetails.tsx    # Dettagli squadra
│   ├── PlayerDetails.tsx  # Dettagli giocatore
│   └── DebugPage.tsx      # Tool debug API
├── types/            # Definizioni TypeScript
│   └── index.ts      # Interfacce API
├── App.tsx           # Routes dell'app
├── main.tsx          # Entry point
└── index.css         # Stili globali e design system
```

## 📜 Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Build di produzione |
| `npm run preview` | Anteprima della build |
| `npm run lint` | Esegue ESLint |

## 🎨 Design System

L'applicazione utilizza un design system moderno con:

- **Glass Morphism** - Card con effetto vetro e blur
- **Gradient Accents** - Gradienti verde/ciano per accenti
- **Dark Theme** - Interfaccia scura ottimizzata per la leggibilità
- **Responsive** - Layout adattivo per mobile e desktop
- **Animazioni fluide** - Transizioni smooth con Framer Motion

## 🔧 Configurazione API

L'app utilizza un proxy Vite per evitare problemi CORS. La configurazione è in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://api.soccersapi.com/v2.2',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 📝 Note

- I dati sono forniti da SoccersAPI e richiedono un account con API key
- L'applicazione è ottimizzata per i campionati italiani
- La pagina Debug (`/debug`) permette di testare endpoint API direttamente

## 📄 Licenza

Questo progetto è privato.

---

Fatto con ❤️ per il calcio italiano
