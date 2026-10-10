import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import { api } from '../api';
import '../styles/Chat.css';
import Header from '../components/Header';
import Avatar from '../components/Avatar';

export default function Chat() {
  usePageTitle('Messages');
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const messagesBoxRef = useRef(null);
  const userId = user?._id;

  // Scroll vers le bas de la conversation
  const scrollToBottom = () => {
    const box = messagesBoxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  };

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
        setTimeout(scrollToBottom, 0);
      })
      .catch(err => console.error('Erreur chargement messages :', err));
  }, [selectedPartner]);

  // Envoi d'un message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const saved = await api('/messages', {
        method: 'POST',
        body: { to: selectedPartner._id, content: newMessage.trim() },
      });
      setMessages(prev => [...prev, saved]);
      setNewMessage('');
      setError('');
      setTimeout(scrollToBottom, 0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Header />
      <main id="contenu" tabIndex={-1} className="page">
        <div className="page-header">
          <div>
            <h1>Messages</h1>
            <p className="page-subtitle">Discutez avec vos partenaires d'entraînement.</p>
          </div>
        </div>

        <div className="card chat-layout">
          <nav className="chat-aside" aria-labelledby="chat-partners-title">
            <h2 id="chat-partners-title">Partenaires</h2>
            {partners.length === 0 ? (
              <p className="muted chat-empty">Aucun partenaire pour le moment. Envoyez une demande depuis le profil d'un membre.</p>
            ) : (
              <ul className="chat-partners">
                {partners.map(partner => {
                  const isSelected = selectedPartner?._id === partner._id;
                  return (
                    <li key={partner._id}>
                      <button
                        type="button"
                        className="chat-partner"
                        onClick={() => setSelectedPartner(partner)}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <Avatar src={partner.profilPic} name={partner.name} size={36} />
                        <span>{partner.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <section className="chat-main" aria-labelledby="chat-conversation-title">
            {selectedPartner ? (
              <>
                <h2 id="chat-conversation-title" className="chat-title">
                  Discussion avec <Link to={`/user/${selectedPartner._id}`}>{selectedPartner.name}</Link>
                </h2>

                <ol
                  ref={messagesBoxRef}
                  className="chat-box"
                  role="log"
                  aria-live="polite"
                  aria-label={`Messages échangés avec ${selectedPartner.name}`}
                  tabIndex={0}
                >
                  {messages.length === 0 && <li className="muted chat-empty">Aucun message. Écrivez le premier !</li>}
                  {messages.map((msg) => {
                    const isMe = msg.from === user._id;
                    const sender = isMe ? user : selectedPartner;

                    return (
                      <li key={msg._id} className={`chat-message ${isMe ? 'right' : 'left'}`}>
                        <Avatar src={sender.profilPic} name={sender.name} size={28} />
                        <p className="chat-bubble">
                          <span className="sr-only">{isMe ? 'Vous' : sender.name} : </span>
                          {msg.content}
                        </p>
                      </li>
                    );
                  })}
                </ol>

                {error && <p className="alert alert-error" role="alert">{error}</p>}

                <form className="chat-input" onSubmit={handleSend}>
                  <label htmlFor="chat-message" className="sr-only">Votre message à {selectedPartner.name}</label>
                  <input
                    id="chat-message"
                    className="input"
                    type="text"
                    placeholder="Écrire un message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={1000}
                    autoComplete="off"
                  />
                  <button type="submit" className="btn btn-primary">Envoyer</button>
                </form>
              </>
            ) : (
              <>
                <h2 id="chat-conversation-title" className="sr-only">Conversation</h2>
                <p className="chat-placeholder">Sélectionnez un partenaire pour commencer la discussion.</p>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
