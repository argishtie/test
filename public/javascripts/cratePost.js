const form = document.getElementById('create');
const token = localStorage.getItem('token');
form.addEventListener('submit', async event => {
	event.preventDefault();

	const formData = new FormData(form);

	try {
		const response = await axios.post('/posts/create', formData, {
			headers: {
				authorization: token,
				'Content-Type': 'multipart/form-data',
			},
		});
		alert('Post created successfully');
		console.log('Response:', response.data);
	} catch (error) {
		console.error('Error:', error);
	}
});
