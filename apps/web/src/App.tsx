import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './app/RequireAuth';
import { ActivityPage } from './pages/ActivityPage';
import { CollaboratorsPage } from './pages/CollaboratorsPage';
import { CreateListAdvancedPage } from './pages/CreateListAdvancedPage';
import { CreateListPage } from './pages/CreateListPage';
import { ExplorePage } from './pages/ExplorePage';
import { HomePage } from './pages/HomePage';
import { ListDetailsPage } from './pages/ListDetailsPage';
import { ListsPage } from './pages/ListsPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { StyleguidePage } from './pages/StyleguidePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/home" />} />

      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dev/styleguide" element={<StyleguidePage />} />

      {/* Protegidas (exigem login) */}
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/collaborators" element={<CollaboratorsPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/lists/new" element={<CreateListPage />} />
        <Route path="/lists/new/advanced" element={<CreateListAdvancedPage />} />
        <Route path="/lists/:listId" element={<ListDetailsPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/home" />} />
    </Routes>
  );
}

export default App;
