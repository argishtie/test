import Users from './models/Users.js';
import Photo from './models/Photo.js';
import Posts from './models/Posts.js';
import Follows from './models/Follows.js';
import Chat from './models/Chat.js';
import ChatRooms from "./models/ChatRooms.js";

// import ChatRoomMembers from "./models/ChatRoomMembers.js";

const models = [
	Users, Posts, Photo, Follows, Chat,
	ChatRooms,
	// ChatRoomMembers
];

(async () => {
	for (const model of models) {
		await model.sync({ alter: true });
		console.log(model.name, `created table ;`);
	}
})();
