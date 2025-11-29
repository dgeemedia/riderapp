// backend/sockets.js
const jwt = require('jsonwebtoken');
const redis = require('./redis');

function init(io) {
  io.use((socket, next) => {
    const { token, role } = socket.handshake.auth || {};
    if (role === 'admin') {
      socket.role = 'admin';
      return next();
    }
    if (!token) return next();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
      socket.riderId = payload.sub;
      socket.role = 'rider';
      return next();
    } catch (e) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.role === 'admin') {
      socket.join('admin');
      console.log('admin connected', socket.id);
    } else if (socket.role === 'rider') {
      const rid = socket.riderId;
      socket.join('rider:' + rid);
      try { if (redis && typeof redis.set === 'function') redis.set(`socket:rider:${rid}`, socket.id, 'EX', 60*60*24); } 
      catch (err) { console.warn('Redis error storing socket mapping:', err.message || err); }
      console.log('rider connected', rid);
    } else {
      console.log('socket connected (no role)', socket.id);
    }

    socket.on('disconnect', () => {
      if (socket.role === 'rider') {
        try { if (redis && typeof redis.del === 'function') redis.del(`socket:rider:${socket.riderId}`); } 
        catch (err) { console.warn('Redis error deleting socket mapping:', err.message || err); }
      }
    });

    socket.on('task:accept', (data) => io.to('admin').emit('task:accepted', { riderId: socket.riderId, taskId: data?.taskId || null }));
    socket.on('ping', (msg) => { if (socket.role === 'admin' && msg?.riderId) io.to('rider:' + msg.riderId).emit('ping', { message: msg.message || 'Ping from dispatch' }); });
  });
}

module.exports = { init };
