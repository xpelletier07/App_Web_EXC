import { useEffect, useRef, useState } from 'react';
// …

export function useGame(code) {
  const [game, setGame] = useState(null);
  const [chat, setChat] = useState({ enabled: true, messages: [] }); // Ajout 1
  const socketRef = useRef(null); // Ajout 2

  useEffect(() => {
    if (!code) return;

    const socket = io({ transports: ['websocket'] });
    socketRef.current = socket; // Ajout 2

    // … les gestionnaires de 'connect' et 'state', inchangés

    // Ajout 3
    socket.on('chat:message', (message) => {
      // À vous : appelez setChat((chat) => ({ ...chat, messages: ... }))
      // en ajoutant message à la fin de chat.messages.

      setChat((chat) => ({
        ...chat,
        messages: [...chat.messages, message],
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  // Ajout 4
  /** Envoie un message au chat. Retourne une promesse de la réponse, {} ou { error }. */
  function sendMessage(nickname, text) {
    // À vous : émettez 'chat:send' avec { nickname, text } sur socketRef.current,
    // avec emitWithAck, et retournez sa promesse.
    return socketRef.current.timeout(5000).emitWithAck('chat:send', { nickname, text });
  }

  return { game, chat, sendMessage };
}