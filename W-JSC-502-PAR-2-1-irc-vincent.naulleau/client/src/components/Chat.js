import React, { useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import UserContext from './UserContext';

const socket = io('http://localhost:4242');

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([{ name: 'general', creator: null }]);
  const { username, setUsername } = useContext(UserContext);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [dmRecipient, setDMRecipient] = useState('');
  const [dmInput, setDMInput] = useState('');

  useEffect(() =>{
    socket.emit('user connected', username);

    socket.on('chat message',(msg)=>{
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    socket.on('user list',(userList)=>{
      setUsers(userList);
    });

    socket.on('channel created',(channel)=>{
      setChannels(prevChannels => [...prevChannels, channel]);
    });

    socket.on('channel deleted',(channelName)=>{
      setChannels(prevChannels => prevChannels.filter(ch => ch.name !== channelName));
      if (channelName === currentChannel) {
        setCurrentChannel('general');
      }
    });

    socket.on('direct message',(msg)=>{
      setMessages(prevMessages => [...prevMessages, msg]);
    });

    return ()=>{
      socket.emit('user disconnected', username);
      socket.off('chat message');
      socket.off('user list');
      socket.off('channel created');
      socket.off('channel deleted');
      socket.off('direct message');
    };
  }, [username, currentChannel]);

  const handleMSG = (e)=>{
    e.preventDefault();
    if (input.trim()) {
      const message = {
        user: username,
        text: input,
        timestamp: new Date().toLocaleString(),
        channel: currentChannel
      };
      socket.emit('chat message', message);
      setInput('');
    }
  };

  const handleSalon = (e)=>{
    e.preventDefault();
    const newChannel = e.target.channel.value.trim();
    if (newChannel && !channels.some(ch => ch.name === newChannel)) {
      socket.emit('create channel', { name: newChannel, creator: username });
      e.target.channel.value = '';
    }
  };

  const deleteChan = (channel)=>{
    socket.emit('delete channel', channel);
  };

  const switchChan = (channel)=>{
    setCurrentChannel(channel);
    socket.emit('join channel', { username, channel });
  };

  const handleChangeName = (e) => {
    e.preventDefault();
    const newUsername = e.target.newUsername.value.trim();
    if (newUsername && newUsername !== username) {
      socket.emit('change username', { oldUsername: username, newUsername });
      setUsername(newUsername);
      e.target.newUsername.value = '';
    }
  };

  const handleDM = (e)=>{
    e.preventDefault();
    if (dmInput.trim() && dmRecipient !== username) {
      const message = {
        from: username,
        to: dmRecipient,
        message: dmInput,
        timestamp: new Date().toLocaleString()
      };
      socket.emit('send dm', message);
      setMessages(prevMessages => [...prevMessages, message]);
      setDMInput('');
    }
  };
  return(
    <div className='chat'>
      <ul className="list">
        {channels.map(channel =>(
          <li key={channel.name}>
            <span onClick={() => switchChan(channel.name)}>{channel.name}</span>
            {channel.name !== 'general' && channel.creator === username && (
              <button onClick={() => deleteChan(channel.name)}>🗑️</button>
            )}
          </li>
        ))}
        <form id="form1" onSubmit={handleSalon}>
          <input name="channel" placeholder='créer un salon' />
          <button>Créer</button>
        </form>
      </ul>
      <div className="container">
        <div className="message--container">
          <div className="messages">
            <div className="message info">
              <span className="time"></span>
              <span className="from">&nbsp;</span>
              <span className="text">Messages since July 19th 2016</span>
            </div>
            {messages.filter(msg => msg.channel === currentChannel).map((msg, index) => (
              msg.user === username ? (
                <div className="message me" key={index}>
                  <span className="time">[{msg.timestamp}]</span>
                  <span className="from">{msg.user}</span>
                  <span className="text">{msg.text}</span>
                </div>
              ) : (
                <div className="message hr" key={index}>
                  <span className="time">[{msg.timestamp}]</span>
                  <span className="from">{msg.user}</span>
                  <span className="text">{msg.text}</span>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="form">
          <form id="form" onSubmit={handleMSG}>
            <input
              placeholder='Entrez votre message'
              id="input"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button>Envoyer</button>
          </form>
        </div>
      </div>
      <ul className="users">
        {users.map((user, index)=>(
          <li key={index}>
            <i className={user.online ? "fa fa-circle state-online" : "fa fa-circle state-offline"}></i>
            {user.name !== username && (
              <span onClick={() => setDMRecipient(user.name)}>{user.name}</span>
            )}
            {user.name === username && (
              <span>{user.name}</span>
            )}
          </li>
        ))}
      </ul>
      <form id="username-form" onSubmit={handleChangeName}>
        <input name="newUsername" placeholder='Nouveau pseudo' />
        <button>Changer</button>
      </form>
      {dmRecipient && (
        <form id="dm-form" onSubmit={handleDM}>
          <input
            name="dmInput"
            placeholder={`DM à ${dmRecipient}`}
            autoComplete="off"
            value={dmInput}
            onChange={(e) => setDMInput(e.target.value)}
          />
          <button>Envoyer DM</button>
        </form>
      )}
    </div>
  );
}

export default Chat;
