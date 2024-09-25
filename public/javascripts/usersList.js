const token = localStorage.getItem('token');

const showUsersList = async () => {
	if (!token) {
		alert('No token found. Please login first.');
		location.href = '/users/login';
		return;
	}

	try {
		const response = await axios.get('/admin/users/list', {
			headers: {
				authorization: token,
			},
		});

		console.log(response.data);

		const usersList = response.data.usersList;
		const usersListElement = document.querySelector('#users-list');

		if (usersList && usersList.length > 0) {
			usersListElement.innerHTML = '';

			usersList.forEach(user => {
				const userItem = document.createElement('li');
				userItem.className = 'user-item';
				userItem.innerHTML = `
                            <h2>${user.firstName} ${user.lastName}</h2>
                            <p>Email: ${user.email}</p>
                            <p>Joined: ${new Date(
															user.createdAt
														).toLocaleDateString()}</p>
                            <p>ID: ${user.id}</p>
														

                            <button class="delete-button" data-id="${
															user.id
														}">Delete</button>
                        `;
				usersListElement.append(userItem);
			});

			document.querySelectorAll('.delete-button').forEach(button => {
				button.addEventListener('click', async () => {
					const userId = button.getAttribute('data-id');

					try {
						const deleteResponse = await axios.delete(
							`/admin/delete/user/${userId}`,
							{
								headers: {
									authorization: token,
								},
							}
						);

						if (deleteResponse.status === 200) {
							button.parentElement.remove();
							alert('User deleted successfully!');
						} else {
							usersListElement.innerHTML =
								'<p class="error">Failed to delete user.</p>';
						}
					} catch (error) {
						console.error('Error deleting user:', error);
						usersListElement.innerHTML =
							'<p class="error">An error occurred while deleting the user.</p>';
					}
				});
			});
		} else {
			usersListElement.innerHTML = '<p class="error">No users found.</p>';
		}
	} catch (error) {
		console.error(error);
		usersListElement.innerHTML =
			'<p class="error">Failed to load users. Please try again later.</p>';
	}
};

showUsersList();
