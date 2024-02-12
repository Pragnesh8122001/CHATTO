const { Participant, Chat, Conversation, User } = require("../models");
class SocketServer {
  constructor() {
    this.constants = require("../helpers/constants");
    this.messages = require("../messages/chat.messages");
  }

  // handle conversation messages
  async handleMessageEvent(io, socket, message, users) {
    try {
      // get active user from users array
      const user = users.find((user) => user.socket_id === socket.id);
      // chat object
      const chatObj = { conversation_id: user.conversation_id, sender_id: user.user_id, content: message }
      // create chat
      const chat = await Chat.create(chatObj);

      const chatList = await Chat.findAll({
        where: {
          conversation_id: user.conversation_id
        },
        include: {
          model: User,
          as: this.constants.DATABASE.CONNECTION_REF.SENDER,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
        },
      })

      // send message to all members joined in room created by conversation id
      io.to(user.conversation_id).emit(this.constants.SOCKET.EVENTS.MESSAGE, { chat: chatList });
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.SEND_MESSAGE_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.SEND_MESSAGE_ERROR
      })
    }
  }

  async handleDisconnectEvent(io, socket, users) {
    try {
      const user = users.find((user) => user.socket_id === socket.id);
      // await Participant.destroy({ where : { user_id : user.user_id, conversation_id : user.conversation_id } });
      socket.leave(user.conversation_id);
      users = users.filter((user) => user.socket_id !== socket.id);
      console.log(users);
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.DISCONNECTION_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.DISCONNECTION_ERROR
      })
    }
  }

  // handle get conversation list
  async handleGetConversationList(io, socket, users) {
    try {
      const user = users.find((user) => user.socket_id === socket.id);
      const chatList = await Chat.findAll({
        where: {
          conversation_id: user.conversation_id
        },
        include: {
          model: User,
          as: this.constants.DATABASE.CONNECTION_REF.SENDER,
          attributes: [
            this.constants.DATABASE.TABLE_ATTRIBUTES.COMMON.ID,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.FIRST_NAME,
            this.constants.DATABASE.TABLE_ATTRIBUTES.USER.LAST_NAME
          ],
        },
      })
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.CONVERSATION_LIST, { chats: chatList });
    } catch (error) {
      console.log(error);
      io.to(socket.id).emit(this.constants.SOCKET.EVENTS.ERROR, {
        message: this.messages.allMessages.CONVERSATION_LIST_ERROR,
        type: this.constants.SOCKET.ERROR_TYPE.CONVERSATION_LIST_ERROR
      });
    }
  }

}

module.exports = new SocketServer();