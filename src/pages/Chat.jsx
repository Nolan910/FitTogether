import { useEffect, useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import '../styles/Chat.css';
import Header from '../components/Header';

export default function Chat() {
  const { user } = useAuthContext();
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!user?._id) return;

    fetch(`https://fittogether-back.onrender.com/user/${user._id}/partners`)
      .then(res => res.json())
      .then(setPartners)
      .catch(err => console.error('Erreur chargement partenaires :', err));
  }, [user]);

  useEffect(() => {
    if (!selectedPartner || !user?._id) return;

    fetch(`https://fittogether-back.onrender.com/messages/${user._id}/${selectedPartner._id}`)
      .then(res => res.json())
      .then(setMessages)
      .catch(err => console.error('Erreur chargement messages :', err));
  }, [selectedPartner, user]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = {
      sender: user._id,
      recipient: selectedPartner._id,
      content: newMessage.trim()
    };

    const res = await fetch('https://fittogether-back.onrender.com/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageToSend)
    });

    if (res.ok) {
      const saved = await res.json();
      setMessages(prev => [...prev, saved]);
      setNewMessage('');
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
                <img src={partner.profilPic} alt="" /> {partner.name}
              </li>
            ))}
          </ul>
        </aside>
        <main className="chat-main">
          {selectedPartner ? (
            <>
              <h3>Discussion avec {selectedPartner.name}</h3>
              <div className="chat-box">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      msg.sender === user._id ? 'right' : 'left'
                    }`}
                  >
                    <span>{msg.content}</span>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleSend}>Envoyer</button>
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
