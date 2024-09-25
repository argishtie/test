const form = document.getElementById('update-profile-form');
form.addEventListener('submit', async e => {
	e.preventDefault();

	const data = {
		firstName: document.querySelector('#firstName').value,
		lastName: document.querySelector('#lastName').value,
	};

	const messageElement = document.getElementById('message');

	try {
		const response = await axios.put('/users/update/user/profile', data, {
			headers: {
				authorization: localStorage.getItem('token'),
			},
		});

		if (response.data.status === 'User updated successfully') {
			messageElement.textContent = 'Profile updated successfully!';
			messageElement.className = 'success';
		} else {
			messageElement.textContent =
				response.data.message || 'Failed to update profile.';
			messageElement.className = 'error';
		}
	} catch (error) {
		console.error('Error updating profile:', error);
		messageElement.textContent = 'An error occurred while updating profile.';
		messageElement.className = 'error';
	}
});
