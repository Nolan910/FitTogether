import { useEffect, useState, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import { api } from '../api';
import '../styles/Chat.css';
import Header from '../components/Header';

export default function Chat() {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const userId = user?._id;

  // Récupération des partenaires
  useEffect(() => {
    if (!userId) return;

    api(`/user/${userId}/partners`)
      .then(setPartners)
      .catch(err => console.error('Erreur chargement partenaires :', err));
  }, [userId]);

  // Récupération des messages avec le partenaire
  useEffect(() => {
    if (!selectedPartner) return;

    api(`/messages/${selectedPartner._id}`)
      .then(data => {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    })
      .catch(err => console.error('Erreur chargement messages :', err));
  }, [selectedPartner]);

  // Envoi d'un message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const saved = await api('/messages', {
        method: 'POST',
        body: { to: selectedPartner._id, content: newMessage.trim() },
      });
      setMessages(prev => [...prev, saved]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  };

  // Scroll vers le bas de la conversation
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
  <>
    <Header />
    <div className="chat-page">
      <aside className="chat-aside">
        <h2>Partenaires</h2>
        <ul>
          {partners.map(partner => (
            <li key={partner._id} onClick={() => setSelectedPartner(partner)}>
              <img className='partner-picture' src={partner.profilPic} alt={partner.name} />
              {partner.name}
            </li>
          ))}
        </ul>
      </aside>
      <main className="chat-main">
        {selectedPartner ? (
          <>
            <h3>Discussion avec {selectedPartner.name}</h3>
            <div className="chat-box">
              {messages.map((msg) => {
                const isMe = msg.from === user._id;
                const sender = isMe ? user : selectedPartner;

                return (
                  <div
                    key={msg._id}
                    className={`chat-message ${isMe ? 'right' : 'left'}`}
                  >
                    <img
                      src={sender.profilPic}
                      alt={sender.name}
                      className="chat-avatar"
                    />
                    <span className="chat-bubble">{msg.content}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                maxLength={1000}
              />
              <button className='send-button' onClick={handleSend}>Envoyer</button>
            </div>
          </>
        ) : (
          <p>Sélectionnez un partenaire pour commencer la discussion.</p>
        )}
      </main>
    </div>
  </>
);

}
