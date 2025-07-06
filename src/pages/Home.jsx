import '../styles/Home.css';
import Header from '../components/Header';
import CreatePostButton from '../components/CreatePostButton';
import HomePosts from '../components/HomePosts';

export default function Home() {

  return (
    <div className="home-container">
      <Header />
      <main className="main">
        <div className="content-container">
          <div className="posts-header">
            <h2>Les postes des utilisateurs</h2>
            <CreatePostButton />
          </div>
          <HomePosts />
        </div>
      </main>
    </div>
  );
}
