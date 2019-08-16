const io = require('./index.js').io

const MongoClient = require('mongodb').MongoClient;
const dbName = "ReactChatApp";
const mongourl = "mongodb://localhost/";

const { VERIFY_USER, USER_CONNECTED, USER_DISCONNECTED, 
		LOGOUT, COMMUNITY_CHAT, MESSAGE_RECIEVED, MESSAGE_SENT,
		TYPING  } = require('../Events')

const { createUser, createMessage, createChat } = require('../Factories')

let connectedUsers = { }

let communityChat = createChat()

module.exports = function(socket,mongodb){
	console.log("Socket Id:" + socket.id);
	MongoClient.connect(mongourl + dbName, function (err, db) {
        if (err)
            throw err;
            console.log("Mongo Bağlantısı başarıyla kuruldu")
       
	let sendMessageToChatFromUser;

	let sendTypingFromUser;

	socket.on(VERIFY_USER, (nickname, callback)=>{
		if(isUser(connectedUsers, nickname)){
			callback({ isUser:true, user:null })
		}else{
			callback({ isUser:false, user:createUser({name:nickname})})
		}
	})

	socket.on(USER_CONNECTED, (user)=>{
		connectedUsers = addUser(connectedUsers, user)
		socket.user = user 

		sendMessageToChatFromUser = sendMessageToChat(user.name)
		sendTypingFromUser = sendTypingToChat(user.name)

		io.emit(USER_CONNECTED, connectedUsers)
		console.log(connectedUsers);

	})
	
	socket.on('disconnect', ()=>{
		if("user" in socket){
			connectedUsers = removeUser(connectedUsers, socket.user.name)

			io.emit(USER_DISCONNECTED, connectedUsers)
			console.log("Disconnect", connectedUsers);
		}
	})

	socket.on(LOGOUT, ()=>{
		connectedUsers = removeUser(connectedUsers, socket.user.name)
		io.emit(USER_DISCONNECTED, connectedUsers)
		console.log("Disconnect", connectedUsers);

	})

	socket.on(COMMUNITY_CHAT, (callback)=>{
		callback(communityChat)
	})

	socket.on(MESSAGE_SENT, ({chatId, message})=>{
		sendMessageToChatFromUser(chatId, message)
		myobj = {Id : chatId, message : message};
		var dbo = db.db(dbName);
                dbo.collection(chatId).insertOne(myobj, function (err, res) {
                    if (err)
                        throw err;
                    console.log("1 document inserted");
                });
	})

	// socket.on(TYPING, ({chatId, isTyping})=>{
	// 	sendTypingFromUser(chatId, isTyping)
	// })
});
} 

function sendTypingToChat(user){
	return (chatId, isTyping)=>{
		io.emit(`${TYPING}-${chatId}`, {user, isTyping})
	}
}

function sendMessageToChat(sender){
	return (chatId, message)=>{
		io.emit(`${MESSAGE_RECIEVED}-${chatId}`, createMessage({message, sender}))
	}
}

function addUser(userList, user){
	let newList = Object.assign({}, userList)
	newList[user.name] = user
	return newList
}

function removeUser(userList, username){
	let newList = Object.assign({}, userList)
	delete newList[username]
	return newList
}

function isUser(userList, username){
  	return username in userList
}
