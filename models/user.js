'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' })

      // New associations for participants
      this.hasMany(models.Participant, { foreignKey: 'user_id', as: 'participants' })

      // New associations for conversations
      this.hasMany(models.Conversation, { foreignKey: 'conversation_creator_id', as: 'conversations' })

      // New associations for chats
      this.hasMany(models.Chat, { foreignKey: 'sender_id', as: 'chats' })
    }
  }
  User.init({
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    department_id: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};