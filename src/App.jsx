import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Messages from './pages/Messages';
import Inscription from './pages/Inscription';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';

// import TestCors from './pages/TestCors';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/post/:id" element={<PostDetail />} />
      </Routes>
  );
}

export default App;
