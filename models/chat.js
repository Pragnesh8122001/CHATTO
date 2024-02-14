'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {

      // Chat belongs to Conversation
      this.belongsTo(models.Conversation, { 
        foreignKey: 'conversation_id',
        as: 'chats'
      });

      // Chat belongs to User
      this.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });

      // Chat Has many to Participant
      this.hasMany(models.Participant, {
        foreignKey: 'conversation_id',
        as: 'participant_chat'
      });
    }
  }
  Chat.init({
    conversation_id: DataTypes.INTEGER,
    sender_id: DataTypes.INTEGER,
    content : DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};
