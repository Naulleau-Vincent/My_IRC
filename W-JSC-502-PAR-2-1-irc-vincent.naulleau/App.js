const config = require('./config_module');
config.app.use(config.cors());

let users = [];
let sockets = {};
const channels = { general: [] };
const delay = {};

config.io.on('connection',(socket)=>{
    socket.on('user connected', (username)=>{
        const user = { id: socket.id, name: username, online: true };
        users.push(user);
        sockets[username] = socket.id;
        config.io.emit('user list', users);

        const connectMessage ={
            user: 'System',
            text: `${username} s'est connecté(e)`,
            timestamp: new Date().toLocaleString(),
            channel: 'general'
        };
        config.io.emit('chat message', connectMessage);
    });
    socket.on('disconnect',()=>{
        let decoUser;
        users = users.map(user =>{
            if(user.id === socket.id){
                decoUser = user.name;
                delete sockets[user.name];
                return { ...user, online: false };
            }
            return user;
        });
        config.io.emit('user list', users);
        if(decoUser){
            const decoMsg ={
                user: 'System',
                text: `${decoUser} s'est déconnecté(e)`,
                timestamp: new Date().toLocaleString(),
                channel: 'general'
            };
            config.io.emit('chat message', decoMsg);
        }
    });
    socket.on('chat message',(msg)=>{
        const { channel } = msg;
        config.io.emit('chat message', msg);

        if (delay[channel]){
            clearTimeout(delay[channel]);
        }
        delay[channel] = setTimeout(()=>{
            delete channels[channel];
            config.io.emit('channel deleted', channel);
            delete delay[channel];
        }, 5*60*1000);
    });

    socket.on('user disconnected', (username)=>{
        users = users.filter(user => user.name !== username);
        delete sockets[username];
        config.io.emit('user list', users);
    });
    socket.on('create channel', (channel)=>{
        channels[channel.name] = [];
        config.io.emit('channel created', channel);

        const newChannelMsg ={
            user: 'System',
            text: `${channel.creator} a créé un nouveau salon: ${channel.name}`,
            timestamp: new Date().toLocaleString(),
            channel: 'general'
        };
        config.io.emit('chat message', newChannelMsg);

        delay[channel.name] = setTimeout(()=>{
            delete channels[channel.name];
            config.io.emit('channel deleted', channel.name);
            delete delay[channel.name];
        }, 5*60*1000);
    });
    socket.on('delete channel',(channelName)=>{
        delete channels[channelName];
        config.io.emit('channel deleted', channelName);
        clearTimeout(delay[channelName]);
        delete delay[channelName];
    });
    socket.on('change username',({ oldUsername, newUsername })=>{
        users = users.map(user => {
            if (user.name === oldUsername) {
                user.name = newUsername;
                sockets[newUsername] = sockets[oldUsername];
                delete sockets[oldUsername];
            }
            return user;
        });
        config.io.emit('user list', users);
    });

    socket.on('join channel',({ username, channel })=>{
        const joinChannelMessage = {
            user: 'System',
            text: `${username} a rejoint le salon: ${channel}`,
            timestamp: new Date().toLocaleString(),
            channel
        };
        config.io.emit('chat message',joinChannelMessage);
   if(delay[channel]){
            clearTimeout(delay[channel]);
        }
        delay[channel] = setTimeout(()=>{
            delete channels[channel];
            config.io.emit('channel deleted', channel);
            delete delay[channel];
        }, 5*60*1000);
    });
    socket.on('send dm', ({ from, to, message })=>{
        const fromSocketId = sockets[from];
        const toSocketId = sockets[to];
        
        if (fromSocketId && toSocketId) {
            config.io.to(toSocketId).emit('direct message', {
                from,
                to,
                message,
                timestamp: new Date().toLocaleString()
            });
        } else {
            console.log(`Utilisateur ${to} n'est pas en ligne pour recevoir le DM.`);
        }
    });
});

config.server.listen(4242, ()=>{
    console.log('listening on *:4242');
});