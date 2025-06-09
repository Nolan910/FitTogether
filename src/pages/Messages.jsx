import { useEffect, useState } from 'react';
import '../styles/Messages.css';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('https://fittogether-back.onrender.com/api/conversations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement des conversations");
        return res.json();
      })
      .then((data) => setConversations(data))
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger les messages.");
      });
  }, []);

  if (error) return <div className="error-text">{error}</div>;

  return (
    <div className="messages-container">
      <h1>Mes messages</h1>
      {conversations.length === 0 ? (
        <p className="no-conversations">Aucune conversation pour l’instant.</p>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li key={conv._id} className="message-item">
              <div className="message-user">Avec : {conv.otherUserName}</div>
              <div className="message-preview">Dernier message : {conv.lastMessage}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
