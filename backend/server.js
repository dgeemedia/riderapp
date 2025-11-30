// backend/server.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth.routes');
const riderRoutes = require('./routes/rider.routes');
const taskRoutes = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');
const callRoutes = require('./routes/call.routes');
const customerRoutes = require('./routes/customer.routes');

const sockets = require('./sockets');

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/call', callRoutes);
app.use('/api/customers', customerRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true, now: Date.now() }));

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: '*' } });

module.exports.io = io

// initialize socket handlers (in separate file)
sockets.init(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
