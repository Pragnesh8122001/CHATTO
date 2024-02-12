class UserRouter {
    constructor() {
      this.router = require("express").Router();
      this.chatController = require("../controller/chat.controller");
      this.setRoutes();
    }
  
    setRoutes() {
      this.router.get("/chat", this.chatController.getChatRequest);
    }
  }
  
  const router = new UserRouter();
  module.exports = router.router;