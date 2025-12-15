# 📘 Guida Sviluppatore - Match Details

Questa guida documenta l'architettura del codice implementato per la pagina Match Details e le API SoccersAPI.

---

## 🔄 API Normalization Layer (API-Agnostic)

L'applicazione usa un **layer di normalizzazione** per essere indipendente dal provider API.

### Struttura
```
src/api/
├── index.ts              ← Punto di ingresso pubblico
├── types/
│   └── normalized.ts     ← Tipi standard (NormalizedMatch, NormalizedTeam, etc)
├── adapters/
│   ├── index.ts          ← Esporta l'adapter attivo
│   ├── soccersapi.ts     ← Adapter per SoccersAPI (attivo)
│   └── apifootball.ts    ← Adapter per API-Football v3
└── football.ts           ← Legacy (per compatibilità)
```

### Come Cambiare Provider API

1. Crea nuovo file: `src/api/adapters/nuovoprovider.ts`
2. Implementa le stesse funzioni (fetchMatch, fetchTeam, etc.)
3. Modifica `src/api/adapters/index.ts`:
   ```typescript
   export * from './nuovoprovider';  // invece di './soccersapi'
   ```

### Tipi Normalizzati Principali

- `NormalizedMatch` - Partita con status, score, teams
- `NormalizedTeam` - Squadra con venue, coach
- `NormalizedStanding` - Classifica
- `NormalizedH2H` - Scontri diretti
- `NormalizedMatchEvent` - Eventi (gol, cartellini)
- `NormalizedMatchStats` - Statistiche
- `NormalizedMatchLineups` - Formazioni

---

## 📁 Struttura File

```
src/
├── api/
│   └── football.ts        ← Tutte le funzioni API
├── pages/
│   ├── MatchDetails.tsx   ← Pagina dettagli partita
│   ├── LeagueDetails.tsx  ← Pagina dettagli lega
│   ├── TeamDetails.tsx    ← Pagina dettagli squadra
│   └── PlayerDetails.tsx  ← Pagina dettagli giocatore
├── types/
│   └── index.ts           ← Tipi TypeScript
├── context/
│   └── AppContext.tsx     ← Stato globale (season, league)
└── App.tsx                ← Route dell'app
```

---

## 🔌 API - `src/api/football.ts`

### Configurazione Base

```typescript
// URL base - usa proxy Vercel in produzione
const API_BASE_URL = '/api';

// Client Axios con credenziali
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    params: {
        user: import.meta.env.VITE_SOCCERSAPI_USER,
        token: import.meta.env.VITE_SOCCERSAPI_TOKEN
    }
});
```

### Funzioni API Disponibili

| Funzione | Endpoint | Parametri | Ritorna |
|----------|----------|-----------|---------|
| `getMatchDetails(id)` | `/fixtures` | `id=X, t=info` | `Fixture` |
| `getMatchStats(id)` | `/stats` | `match_id=X, t=info` | Stats object |
| `getMatchEvents(id)` | `/fixtures/events` | `match_id=X, t=info` | Eventi array |
| `getMatchLineups(id)` | `/fixtures/lineups` | `match_id=X, t=info` | Lineups object |
| `getH2H(team1, team2)` | `/h2h` | `team1=X, team2=Y, t=teams` | H2HData |
| `getTeamFixtures(teamId, seasonId)` | `/fixtures` | `season_id=X, team_id=Y, t=season` | Fixture[] |
| `getVenue(id)` | `/venues` | `id=X, t=info` | Venue |
| `getLeaders(seasonId)` | `/leaders` | `season_id=X, t=topscorers` | Leader[] |
| `getTeam(id)` | `/teams` | `id=X, t=info` | TeamDetails |
| `getPlayer(id)` | `/players` | `id=X, t=info` | Player |
| `getCoach(id)` | `/coaches` | `id=X, t=info` | Coach |

### Come Aggiungere una Nuova API

```typescript
// In src/api/football.ts
export const getNuovaAPI = async (paramId: string): Promise<TipoRitorno> => {
    try {
        const response = await apiClient.get<ApiResponse<TipoRitorno>>('/endpoint', {
            params: {
                id: paramId,
                t: 'info'  // o altro tipo
            }
        });
        console.log('Risposta:', response.data);
        return response.data.data || null;
    } catch (error) {
        console.error("Errore:", error);
        return null;
    }
};
```

---

## 📄 MatchDetails.tsx - Struttura Pagina

### 1. Import e Stati (inizio file)

```typescript
import { getMatchDetails, getMatchStats, getMatchEvents, ... } from '../api/football';

// Stati per ogni sezione
const [match, setMatch] = useState<Fixture | null>(null);
const [stats, setStats] = useState<any>(null);
const [events, setEvents] = useState<any[]>([]);
const [lineups, setLineups] = useState<any>(null);
const [h2h, setH2H] = useState<H2HData | null>(null);
const [homeForm, setHomeForm] = useState<any[]>([]);
const [awayForm, setAwayForm] = useState<any[]>([]);
```

### 2. useEffect - Caricamento Dati

```typescript
useEffect(() => {
    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        
        try {
            // 1. Dati base partita
            const data = await getMatchDetails(id);
            setMatch(data);
            
            // 2. Dati aggiuntivi (venue, H2H)
            const venueId = (data as any)?.venue_id;
            if (venueId) {
                const venueData = await getVenue(String(venueId));
                setVenue(venueData);
            }
            
            // 3. Dati in parallelo (stats, eventi, formazioni)
            const [statsData, eventsData, lineupsData] = await Promise.all([
                getMatchStats(id),
                getMatchEvents(id),
                getMatchLineups(id)
            ]);
            setStats(statsData);
            setEvents(eventsData);
            setLineups(lineupsData);
            
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, [id]);  // Ri-esegue quando cambia l'id
```

### 3. Sezioni UI

| Sezione | Condizione Render | Descrizione |
|---------|-------------------|-------------|
| Header Partita | `match` | Logo squadre, risultato, info base |
| Info Partita | sempre | Competizione, data, stadio |
| Scontri Diretti | `h2h?.h2h?.length > 0` | Stats H2H + liste partite precedenti |
| Statistiche | `stats` | Barre comparative (possesso, tiri, etc) |
| Eventi | `events.length > 0` | Lista eventi con icone |
| Formazioni | `lineups` | 11 titolari per squadra |
| Forma Recente | `homeForm.length > 0 \|\| awayForm.length > 0` | Badge V/P/S |

---

## 🎨 Componenti Helper

### InfoRow - Riga info semplice
```typescript
function InfoRow({ label, value, highlight = false }) {
    return (
        <div className="flex justify-between ...">
            <span>{label}</span>
            <span>{value || 'N/D'}</span>
        </div>
    );
}
```

### StatBar - Barra statistica comparativa
```typescript
function StatBar({ label, homeValue, awayValue, suffix = '' }) {
    const total = homeValue + awayValue || 1;
    const homePercent = (homeValue / total) * 100;
    
    return (
        <div>
            <div className="flex justify-between">
                <span>{homeValue}{suffix}</span>
                <span>{label}</span>
                <span>{awayValue}{suffix}</span>
            </div>
            <div className="flex h-2 bg-dark-700">
                <div className="bg-primary-500" style={{ width: `${homePercent}%` }} />
                <div className="bg-secondary-500" style={{ width: `${100-homePercent}%` }} />
            </div>
        </div>
    );
}
```

### getEventIcon - Icona per tipo evento
```typescript
function getEventIcon(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('goal')) return '⚽';
    if (t.includes('yellow')) return '🟨';
    if (t.includes('red')) return '🟥';
    if (t.includes('sub')) return '🔄';
    return '📌';
}
```

---

## ✏️ Come Modificare

### Aggiungere Nuova Sezione

1. **Aggiungi stato** in MatchDetails.tsx:
```typescript
const [nuovoDato, setNuovoDato] = useState<TipoDato | null>(null);
```

2. **Crea funzione API** in football.ts:
```typescript
export const getNuovoDato = async (matchId: string) => { ... }
```

3. **Importa e chiama** nel useEffect:
```typescript
import { getNuovoDato } from '../api/football';
// nel useEffect:
const dato = await getNuovoDato(id);
setNuovoDato(dato);
```

4. **Aggiungi UI** nel JSX:
```typescript
{nuovoDato && (
    <motion.div className="glass-card p-6">
        <h3>Titolo Sezione</h3>
        {/* contenuto */}
    </motion.div>
)}
```

### Modificare Stile

- **Colori**: Definiti in `tailwind.config.js` (dark-XXX, primary-XXX)
- **Glass effect**: Classe `glass-card` definita in CSS
- **Animazioni**: Usa `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>`

### Aggiungere Nuova Route

In `src/App.tsx`:
```typescript
import { NuovaPagina } from './pages/NuovaPagina';
// nelle Routes:
<Route path="/nuovo/:id" element={<NuovaPagina />} />
```

---

## 📚 Documentazione API

- **SoccersAPI Docs**: https://docs.soccersapi.com
- **Endpoints usati**:
  - Fixtures: `/fixtures`
  - Stats: `/stats`
  - Events: `/fixtures/events`
  - Lineups: `/fixtures/lineups`
  - H2H: `/h2h`
  - Teams: `/teams`
  - Players: `/players`
  - Venues: `/venues`

---

## 🔧 Debug

1. Apri DevTools (F12) → Console
2. Cerca log tipo `"Match details:"`, `"H2H response:"`, etc.
3. Controlla Network tab per vedere chiamate API

---

*Ultima modifica: Dicembre 2024*
