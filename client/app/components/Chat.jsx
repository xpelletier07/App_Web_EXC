import { useState } from 'react';

/** Affiche le chat de la partie. Un joueur lit et écrit ; l'animateur lit seulement. */
export default function Chat({ chat, sendMessage, nickname }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);

  async function send(event) {
    event.preventDefault();
    const reply = await sendMessage(nickname, text);
    // À vous : si reply.error existe, affichez-la avec setError ;
    // sinon, videz le champ et effacez l'erreur.
  }

  return (
    <section className="card chat">
      <h2>Chat</h2>
      <ul className="chat-messages">
        {/* À vous : pour chaque message m de chat.messages, affichez un
            <li key={m.id}> qui contient <strong>{m.nickname}</strong>
            suivi de {m.text}. */}
      </ul>

      {nickname && (
        <form className="chat-form" onSubmit={send}>
          {/* À vous : ajoutez un <input> contrôlé (value={text} et onChange)
              et un <button>Envoyer</button>. */}
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}