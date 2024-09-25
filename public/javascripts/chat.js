const token = localStorage.getItem('token');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userElement = document.getElementById('usersList');
const userProfile = document.querySelector('.userProfile');

let userId = null;
let targetId = null;
let newMessages = {};

const userList = async data => {
  try {
    const response = await axios.get('/chat/users', {
      headers: {
        authorization: token,
      },
    });

    const rooms = response.data.rooms;

    const { firstName, lastName, avatar } = response.data.user;

    userProfile.innerHTML = `
			<img
							src=" ${avatar}"
							alt="User Avatar"
							class="userProfile-img"
						/>
						<div class="userProfile-box">
							<p>online</p>
							<span> ${firstName} ${lastName}</span>
						</div>
		`;

    rooms.forEach((room, i) => {
      const li = document.createElement('li');
      li.classList.add('user-container');

      if (i === 0) {
        li.classList.add('active');
        targetId = room.user.id;
        showMessages(room.user.id)
      }

      console.log(i)

      li.setAttribute('id', room.user.id);

      li.innerHTML = `
				<img src="${room.user.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="User Avatar"/>
				<span>${room.user.firstName} ${room.user.lastName}</span>
				<span class="dot" style="display: none;">•</span> 
			`;

      li.addEventListener('click', () => {
        showMessages(room.user.id);
      });

      userElement.append(li);
    });
  } catch (error) {
    console.log(error);
  }
};

async function socket() {
  if (!token) {
    alert('No token found. Please login first.');
    location.href = '/';
    return;
  }

  userList();

  const socket = io.connect('test-9tkh.onrender.com', {
    extraHeaders: {
      authorization: `${token}`,
    },
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (!userId) {
      alert('Please select a user before sending a message.');
      return;
    }

    if (input.value) {
      socket.emit('newMessage', {
        message: input.value,
        userId,
      });

      const item = document.createElement('li');
      item.textContent = input.value;
      item.classList.add('message-left');
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
      input.value = '';
    }
  });

  socket.on('newMessage', (data) => {
    const item = document.createElement('li');
    item.textContent = data.message;

    if (data.senderId !== targetId) {
      Toastify({
        text: 'New message from ' + data.senderName,
        duration: 3000
      }).showToast();
    }

    if (data.senderId !== userId) {
      const userListItem = document.querySelector(`[id="${data.senderId}"]`);
      const dot = userListItem.querySelector('.dot');
      dot.style.display = 'inline';
      dot.style.color = '#ff9400';
      dot.style.fontSize = '33px';

      if (!newMessages[data.senderId]) {
        newMessages[data.senderId] = 1;
      } else {
        newMessages[data.senderId]++;
      }
    } else {
      item.classList.add('message-right');
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  socket.on('typing', (data) => {
    console.log(data);
  });

  input.onkeydown = () => {
    console.log(1)
    socket.emit('typing', {
      userId: targetId,
    });
  }
}

async function showMessages(id) {
  const response = await axios.get(`/chat/messages?userId=${id}`, {
    headers: {
      authorization: token,
    },
  });

  form.style.position = 'relative';
  form.style.zIndex = '1';

  const { messages: messagesList } = response.data;

  messages.innerHTML = '';

  messagesList.forEach(element => {
    const item = document.createElement('li');

    const date = moment(element.createdAt).format('MMMM Do YYYY, h:mm:ss');

    let className = ''

    if (element.senderId === id) {
      className = 'message-right';
    } else {
      className = 'message-left';
    }

    item.innerHTML = `
      <div class="inner-message ${className}">
        ${element.message} <br>
        ${date}
      </div>
    `;

    messages.appendChild(item);
  });

  $('.user-container').removeClass('active');

  targetId = id;

  const userListItem = document.querySelector(`[id="${id}"]`);

  $(userListItem).addClass('active');

  const dot = userListItem.querySelector('.dot');
  dot.style.display = 'none';

  newMessages[id] = 0;

  userId = id;
}

// async function requests() {
// 	try {
// 		const res = await axios.get('/chat/requests', {
// 			headers: {
// 				authorization: token,
// 			},
// 		});

// 		const { requests } = res.data;

// 		requests.forEach(item => {
// 			const li = document.createElement('li');

// 			li.setAttribute('id', item.id);

// 			li.innerHTML = `
// 		  <img src="${item.avatar}" alt="User Avatar"/>
// 			<span>${item.firstName} ${item.lastName}</span>
// 			<span class="dot" style="display: none;">•</span>
// 		        `;

// 			li.addEventListener('click', () => {
// 				showMessages(item.id);
// 			});

// 			userElement.prepend(li);
// 		});
// 	} catch (error) {
// 		console.error('Error fetching requests', error);
// 	}
// }

// requests();

socket();
