// backend/sockets.js - UPDATED CORRECT VERSION
const jwt = require('jsonwebtoken');
const redis = require('./redis');

function init(io) {
  io.use((socket, next) => {
    const { token, role } = socket.handshake.auth || {};
    
    // Vendor connection (for vendor portal)
    if (role === 'vendor') {
      socket.role = 'vendor';
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'devjwt');
        socket.vendorId = payload.sub;
        return next();
      } catch (e) {
        return next();
      }
    }
    
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
    } else if (socket.role === 'vendor') {
      const vid = socket.vendorId;
      socket.join('vendor:' + vid);
      console.log('vendor connected', vid);
    } else {
      console.log('socket connected (no role)', socket.id);
    }

    socket.on('disconnect', () => {
      if (socket.role === 'rider') {
        try { if (redis && typeof redis.del === 'function') redis.del(`socket:rider:${socket.riderId}`); } 
        catch (err) { console.warn('Redis error deleting socket mapping:', err.message || err); }
      }
    });

    // Handle vendor registration from vendor portal
    socket.on('vendor:register', (data) => {
      console.log('Vendor registration request from socket:', data);
      // This would trigger the backend to process vendor registration
      // For now, just forward to admin
      io.to('admin').emit('vendor:registration_request', data);
    });

    // Handle task acceptance from riders
    socket.on('task:accept', (data) => io.to('admin').emit('task:accepted', { riderId: socket.riderId, taskId: data?.taskId || null }));
    
    // Handle ping from admin to riders
    socket.on('ping', (msg) => { 
      if (socket.role === 'admin' && msg?.riderId) {
        io.to('rider:' + msg.riderId).emit('ping', { 
          message: msg.message || 'Ping from dispatch' 
        });
      }
    });
    
    // Handle order status updates from vendors
    socket.on('order:status_update', (data) => {
      if (socket.role === 'vendor') {
        console.log('Order status update from vendor:', data);
        io.to('admin').emit('order:status_updated', {
          ...data,
          vendorId: socket.vendorId
        });
      }
    });
  });
}

module.exports = { init };