const token = localStorage.getItem('token');
const section = document.querySelector('.books');

async function getBooks() {
	try {
		const response = await axios.get('/admin/review', {
			headers: {
				authorization: token,
			},
		});
		const review = response.data.review;
		if (review.length === 0) {
			section.innerHTML = 'No books found';
			return;
		}
		console.log(review);

		review.forEach(async item => {
			const containerBook = document.createElement('div');
			containerBook.className = 'book';
			containerBook.style = ' padding: 10px; margin-bottom: 10px;';
			containerBook.innerHTML = `
        <h3> ${item.book.title}</h3>
        <p> author: ${item.book.author}</p>
        <p>category: ${item.book.category}</p>
        <div class="content-boxs">
					<p>user: ${item.user.firstName} ${item.user.lastName}</p>
					<p>date: ${new Date(item.createdAt).toLocaleDateString()}</p>
						<p>review: ${item.review}</p>
						<p>rating: ${item.rating}</p>
					<div class="reviews-btn">
						<a href="#" class="delete-button button-10" data-id="${
							item.id
						}" style="text-decoration: none">Delete</a>
					</div>	
				</div>
			
      `;

			const deleteButton = containerBook.querySelector('.delete-button');
			deleteButton.addEventListener('click', () => {
				deleteBook(deleteButton.dataset.id);
			});
			section.append(containerBook);
		});
	} catch (error) {
		console.error(error);
	}
}

async function deleteBook(id) {
	try {
		await axios.delete(`/admin/review/${id}`, {
			headers: {
				authorization: token,
			},
		});

		location.reload();
	} catch (error) {
		console.error(error);
	}
}

getBooks();
