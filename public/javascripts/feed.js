const post = document.querySelector('.post');
const token = localStorage.getItem('token');

const postContainer = document.querySelector('.post-container');

async function postList() {
	if (!token) {
		alert('No token found. Please login first.');
		location.href = '/users/login';
		return;
	}
	try {
		const response = await axios.get('/posts/list', {
			headers: {
				authorization: token,
			},
		});
		const data = response.data.posts;

		data.forEach(element => {
			const { user, photos } = element;
			const [path] = user.avatar;
			const feed = document.createElement('div');
			feed.className = 'feed';

			feed.innerHTML = `
        	<div class="feed-author">
										<img src="${path.path}"alt="logo"/>
										<p>${user.firstName + ' ' + user.lastName}</p>
									</div>
                  <p>${new Date(element.createdAt).toDateString()}</p>
									<div class="post-img">
										<div class="div1">
											<img src="${photos[0].path}"alt=""/>
										</div>
										<div class="div2">
											<img src="${photos[1].path}"alt=""/>
										</div>
                    <div class="div3">
                      <img src="${photos[2].path}"alt=""/>
                    </div>
									</div>
									<div class="post-text">
                    <h3>${element.title}</h3>
										<p>${element.content}</p>
									</div>
      
      `;

			postContainer.appendChild(feed);
		});
	} catch (error) {
		console.error(error);
	}
}

postList();
