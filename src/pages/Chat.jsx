import { useEffect, useState, useRef } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/Chat.css';
import Header from '../components/Header';
import ErrorModal from '../components/ErrorModal';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const { user } = useAuthContext();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Récupération des partenaires
  useEffect(() => {
    if (!user?._id) return;

    fetch(`https://fittogether-back.onrender.com/user/${user._id}/partners`)
      .then(res => res.json())
      .then(setPartners)
      .catch(err => console.error('Erreur chargement partenaires :', err));
  }, [user]);

  // Récupération des messages avec le partenaire
  useEffect(() => {
    if (!selectedPartner || !user?._id) return;

    fetch(`https://fittogether-back.onrender.com/messages/${user._id}/${selectedPartner._id}`)
      .then(res => res.json())
      .then(data => {
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    })
      .catch(err => console.error('Erreur chargement messages :', err));
  }, [selectedPartner, user]);

  // Envoi d'un message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = {
      from: user._id,
      to: selectedPartner._id,
      content: newMessage.trim()
    };

    const res = await fetch('https://fittogether-back.onrender.com/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(messageToSend)
    });

    if (res.ok) {
      const saved = await res.json();
      setMessages(prev => [...prev, saved]);
      setNewMessage('');
      scrollToBottom();
    }
  };

  // Scroll vers le bas de la conversation
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!user) {
      return (
        <ErrorModal
          message="Veuillez vous connectez afin d'avoir accès au chat"
          onClose={() => navigate(-1)} 
        />
      );
    }


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
              {messages.map((msg, index) => {
                const isMe = msg.from === user._id;
                const sender = isMe ? user : selectedPartner;

                return (
                  <div
                    key={index}
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
