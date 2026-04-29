module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room based on userId for personal notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    // Join a city room for broadcast notifications
    socket.on('joinCity', (city) => {
      socket.join(`city_${city}`);
      console.log(`User joined city room: ${city}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
