import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ActivityPage } from './pages/ActivityPage';
import { CollaboratorsPage } from './pages/CollaboratorsPage';
import { CreateListAdvancedPage } from './pages/CreateListAdvancedPage';
import { CreateListPage } from './pages/CreateListPage';
import { EmptyListsPage } from './pages/EmptyListsPage';
import { ExplorePage } from './pages/ExplorePage';
import { ListDetailsPage } from './pages/ListDetailsPage';
import { ListsPage } from './pages/ListsPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="/lists/empty" element={<EmptyListsPage />} />
      <Route path="/collaborators" element={<CollaboratorsPage />} />
      <Route path="/lists" element={<ListsPage />} />
      <Route path="/lists/new" element={<CreateListPage />} />
      <Route path="/lists/new/advanced" element={<CreateListAdvancedPage />} />
      <Route path="/lists/birthday" element={<ListDetailsPage />} />
    </Routes>
  );
}

export default App;
