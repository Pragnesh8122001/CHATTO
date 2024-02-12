/** @format */

const { Conversation, Participant } = require("../models");
class ChatController {
  constructor() {
    this.messages = require("../messages/chat.messages");
  }
  getChatRequest = async (req, res) => {
    try {
      const { chatName } = req.query;
      // get the conversation by conversation name
      let conversation = await Conversation.findOne({
        where: {
          conversation_name: chatName,
        },
      });
      // If conversation is not found
      if (!conversation) {
        // new conversation object
        const conversationObj = {
          conversation_name: chatName,
          description: "",
          conversation_creator_id: req.currentUser.user_id,
        };
        // create new conversation
        const newConversation = await Conversation.create(conversationObj);
        conversation = newConversation;
      }
      // participant object
      const participantObj = {
        user_id: req.currentUser.user_id,
        conversation_id: conversation.id,
      };
      // create new participant
      await Participant.create(participantObj);
      res.send({
        message: this.messages.allMessages.CHAT_CREATED_SUCCESSFULLY,
        conversation,
      });
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new ChatController();
