import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Inscription from './pages/Inscription';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import PublicProfile from './pages/PublicProfile';
import Chat from './pages/Chat';


function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/user/:id" element={<PublicProfile />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/chat" element={<Chat/>} />
      </Routes>
  );
}

export default App;
