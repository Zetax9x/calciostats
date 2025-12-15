import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LeagueDetails } from './pages/LeagueDetails';
import { Home } from './pages/Home';
import { DebugPage } from './pages/DebugPage';
import { PlayerDetails } from './pages/PlayerDetails';
import { TeamDetails } from './pages/TeamDetails';
import { MatchDetails } from './pages/MatchDetails';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/league/:id" element={<LeagueDetails />} />
            <Route path="/player/:id" element={<PlayerDetails />} />
            <Route path="/team/:id" element={<TeamDetails />} />
            <Route path="/match/:id" element={<MatchDetails />} />
            <Route path="/debug" element={<DebugPage />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
