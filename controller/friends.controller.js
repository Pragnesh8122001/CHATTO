/** @format */

const { Conversation, Participant, Friend, User } = require("../models");
class FriendsController {
  constructor() {
    this.messages = require("../messages/friends.messages");
    this.validation = require("../validations/friends.validation");
    this.helpers = require("../helpers/helper");
  }

  // Send friend request (POST)
  sendFriendRequest = async (req, res) => {
    let sendFriendReqValidation = this.validation.friendReqValidation.validate(req.body);
    if (sendFriendReqValidation.error) {
      res.status(403).send({
        status: false,
        message: sendFriendReqValidation.error.details[0].message,
      });
    } else {
      try {
        const { user_code } = req.body;

        // Check if receiver exists
        const receiver = await User.findOne({ where: { user_code } });

        // if receiver user not exist
        if (!receiver) {
          return res.status(400).send({
            status: false,
            message: this.messages.allMessages.RECEIVER_NOT_FOUND,
          });
        }

        // Check if user already sent friend request
        const existingFriendReq = await Friend.findOne({
          where: {
            from_user_id: req.currentUser.user_id,
            to_user_id: receiver.id,
          },
        })
        // if user already sent friend request
        if (existingFriendReq) {

          if (existingFriendReq.status === "accepted") {
            return res.status(400).send({
              status: false,
              message: this.messages.allMessages.ALREADY_FRIENDS,
            });
          }

          // Check if user has sent too many friend request
          if (existingFriendReq.req_occurrence_count >= 5) {
            return res.status(400).send({
              status: false,
              message: this.messages.allMessages.TOO_MANY_REQUESTS_SENT,
            });
          }

          // if user already sent friend request and was rejected by receiver then send request again
          if (existingFriendReq.status === "rejected") {
            existingFriendReq.req_occurrence_count++;
            existingFriendReq.status = "pending";
            await existingFriendReq.save();
            return res.status(200).send({
              status: true,
              message: this.messages.allMessages.FRIEND_REQUEST_SENT,
            });
          }

          // if user already sent friend request
          return res.status(400).send({
            status: false,
            message: this.messages.allMessages.FRIEND_REQUEST_ALREADY_SENT,
          });
        }

        await Friend.create({ from_user_id: req.currentUser.user_id, to_user_id: receiver.id, status: "pending" });
        res.status(200).send({
          status: true,
          message: this.messages.allMessages.FRIEND_REQUEST_SENT,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: false,
          message: this.messages.allMessages.FRIEND_REQUEST_FAILED,
        });
      }
    }
  };

  // Get friend request list (GET)
  getFriendRequestList = async (req, res) => {
    try {
      const friends = await Friend.findAll({
        where: {
          to_user_id: req.currentUser.user_id,
          status: "pending",
        },
        include: [
          {
            model: User,
            attributes: ["id", "first_name", "last_name", "user_code"],
            as: "req_from"
          },
        ],
      });
      res.status(200).send({
        status: true,
        message: this.messages.allMessages.GET_FRIEND_REQUEST,
        friends,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: false,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_FAILED,
      });
    }
  };

  // Get friend request count (GET)
  getFriendRequestCount = async (req, res) => {
    try {
      const count = await Friend.count({
        where: {
          to_user_id: req.currentUser.user_id,
          status: "pending",
        },
      });
      res.status(200).send({
        status: true,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_COUNT,
        count,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        status: false,
        message: this.messages.allMessages.GET_FRIEND_REQUEST_COUNT_FAILED,
      });
    }
  };

  // Response friend request (accepted/rejected) (PUT)
  responseFriendRequest = async (req, res) => {
    let responseFriendRequestValidation = this.validation.responseFriendReqValidation.validate(req.body);
    if (responseFriendRequestValidation.error) {
      res.status(403).send({
        status: false,
        message: responseFriendRequestValidation.error.details[0].message,
      });
    } else {
      try {
        const { status } = req.body;
        const { reqId } = req.params;

        // get existing request details
        const existingRequest = await Friend.findOne({ where: { id: reqId } });

        // if request does not exist
        if (!existingRequest) {
          return res.status(400).send({
            status: false,
            message: this.messages.allMessages.REQUEST_NOT_EXIST,
          });
        }

        if (existingRequest.status === "accepted") {
          return res.status(400).send({
            status: false,
            message: this.messages.allMessages.ALREADY_FRIENDS,
          });
        }

        await Friend.update({ status }, { where: { id: reqId } });
        const message = status === "accepted" ? this.messages.allMessages.ACCEPTED_FRIEND_REQUEST : this.messages.allMessages.REJECTED_FRIEND_REQUEST;
        res.status(200).send({
          status: true,
          message: message,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          status: false,
          message: this.messages.allMessages.RESPONSE_FRIEND_REQUEST_FAILED,
        });
      }
    }
  }
}

module.exports = new FriendsController();
