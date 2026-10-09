const express = require('express');
const Router = express.Router();

const {
    chatController
} = require('../controllers/chats.controller.js')

Router.route('/chats').post(chatController);

module.exports = Router;