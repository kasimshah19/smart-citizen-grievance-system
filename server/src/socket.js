const jwt = require("jsonwebtoken");

let io = null;

// Called once, when the HTTP server starts. Every connecting client must send
// their JWT in the connection handshake — we use it to put them in a private
// "room" named after their own citizen ID, so we can push events to just them.
const init = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(decoded.id);
      } catch (error) {
        // Invalid/expired token — the socket stays connected but won't be in
        // any room, so it simply won't receive any targeted events.
      }
    }

    socket.on("disconnect", () => {});
  });

  return io;
};

// Controllers call this to emit events. Wrapped in a check so a missing
// Socket.io setup (e.g. during tests) never crashes a real HTTP request.
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet");
  }
  return io;
};

// Safe helper — emits to a citizen's room, but never throws if sockets
// aren't available for some reason. Real-time updates are a nice-to-have;
// they should never be able to break the actual API response.
const notifyCitizen = (citizenId, event, payload) => {
  try {
    getIO().to(citizenId.toString()).emit(event, payload);
  } catch (error) {
    console.error("Socket emit failed:", error.message);
  }
};

module.exports = { init, getIO, notifyCitizen };
