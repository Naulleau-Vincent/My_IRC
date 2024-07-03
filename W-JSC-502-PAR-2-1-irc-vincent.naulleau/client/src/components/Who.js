import '../App.css';

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from './UserContext';

const Who = () => {
  const [input, setInput] = useState("");
  const { setUsername } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setUsername(input);
      navigate('/chat');
    }
  }

  return (
    <form id="form" onSubmit={handleSubmit}>
      <input
        placeholder='Entrez votre pseudo'
        id="inputWho"
        autoComplete="off"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button>Valider</button>
    </form>
  );
}

export default Who;
