class Socket {
  constructor() {
    this.app = require("express")();
    this.http = require("http").Server(this.app);
    this.jwt = require("jsonwebtoken");
    this.services = require("./services/socket-services")
    this.validation = require("./validations/socket.validation")
    this.server = require("socket.io")(this.http, {
      cors: {
        origin: "*",
      },
    });
    //   this.messages = require("./helpers/messages")
    this.constants = require("./helpers/constants")
    this.users = [];
    this.io = this.server.on(this.constants.SOCKET.EVENTS.CONNECTION, async (socket) => {
      const { token } = socket.handshake.query;
      const tokenDecoded = this.jwt.decode(token);
      const { user_name, user_id } = tokenDecoded;
      // validate handshake query
      let hand_shake_validation = this.validation.HandShakeValidation.validate({ user_name, user_id });

      if (hand_shake_validation.error) {
        console.log(hand_shake_validation.error.details[0].message);
      } else {
        try {

          // push the user details into users array
          this.users.push({ id: socket.id, user_name, user_id: Number(user_id) });
          // console.log(this.users);
          // listen to message event
          socket.on(this.constants.SOCKET.EVENTS.MESSAGE, (message) => this.services.handleMessageEvent(this.io, socket, message.content, this.users));
          // listen to get conversation list event
          socket.on(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, () => this.services.handleGetConversationList(this.io, socket, this.users));
          // listen to disconnection event
          socket.on(this.constants.SOCKET.EVENTS.DISCONNECT, () => this.services.handleDisconnectEvent(this.io, socket, this.users));
          console.log("OUTSIDE ::: ", this.users);
        } catch (error) {
          console.log(error);
        }
      }
    });

    this.http.listen(process.env.SOCKET_SERVER_PORT, function () {
      console.log(`socket server is listening on port :${process.env.SOCKET_SERVER_PORT}`);
    });
  }
}
module.exports = new Socket();