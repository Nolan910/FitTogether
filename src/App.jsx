import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Inscription from './pages/Inscription';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import PublicProfile from './pages/PublicProfile';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/profil" element={<ProtectedRoute><Profil /></ProtectedRoute>} />
        <Route path="/user/:id" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
  );
}

export default App;
