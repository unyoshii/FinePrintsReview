// Generate or retrieve a unique user ID for the current customer
let currentUserId = localStorage.getItem('currentUserId');
if (!currentUserId) {
  currentUserId = '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('currentUserId', currentUserId);
}

// Star Rating Functionality
const stars = document.querySelectorAll('.star-rating span');
const ratingInput = document.getElementById('rating');

stars.forEach(star => {
  star.addEventListener('click', function () {
    const value = this.getAttribute('data-value');
    ratingInput.value = value; // Set the hidden input value

    // Highlight selected stars
    stars.forEach((s, index) => {
      if (index < value) {
        s.classList.add('selected');
      } else {
        s.classList.remove('selected');
      }
    });
  });
});

// Save reviews to localStorage
function saveReviews(reviews) {
  localStorage.setItem('reviews', JSON.stringify(reviews));
}

// Load reviews from localStorage
function loadReviews() {
  const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
  return reviews;
}

// Format date and time for display
function formatDateTime(date) {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Date(date).toLocaleString('en-US', options);
}

/* // Compute and update the overall average rating
function updateOverallScore() {
  const reviews = loadReviews();
  const overallScoreElement = document.getElementById('overallScore');
  const headerOverallRatingElement = document.getElementById('headerOverallRating');
  
  if (reviews.length === 0) {
    if (overallScoreElement) {
      overallScoreElement.textContent = 'Overall Score: No reviews yet';
    }
    if (headerOverallRatingElement) {
      headerOverallRatingElement.textContent = 'No reviews yet';
    }
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  const averageRating = totalRating / reviews.length;
  const averageText = averageRating.toFixed(1) + ' / 5';
  
  if (overallScoreElement) {
    overallScoreElement.textContent = `Overall Score: ${averageText}`;
  }
  if (headerOverallRatingElement) {
    headerOverallRatingElement.textContent = averageText;
  }
} */

// Render reviews on the page and update overall score
function renderReviews() {
  const reviews = loadReviews();
  const reviewsList = document.getElementById('reviewsList');
  reviewsList.innerHTML = ''; // Clear previous reviews

  reviews.forEach((review, index) => {
    const reviewItem = document.createElement('div');
    reviewItem.classList.add('review-item');

    // Only display the delete button if the review belongs to the current user
    let deleteButtonHTML = '';
    if (review.userId === currentUserId) {
      deleteButtonHTML = `<button class="delete-btn" data-index="${index}">🗑️</button>`;
    }

    reviewItem.innerHTML = `
      <h3>${review.name}</h3>
      <p class="rating">Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</p>
      <p>${review.review}</p>
      <p class="timestamp">${formatDateTime(review.timestamp)}</p>
      ${deleteButtonHTML}
    `;
    reviewsList.appendChild(reviewItem);
  });

  // Attach event listeners to delete buttons (for reviews belonging to the current user)
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', deleteReview);
  });

  // Update the overall score display in both the reviews section and the header
  updateOverallScore();
}

// Delete a review (only if it belongs to the current user)
function deleteReview(e) {
  const index = e.target.getAttribute('data-index');
  const reviews = loadReviews();

  // Double-check ownership before deletion
  if (reviews[index].userId !== currentUserId) {
    alert('You can only delete your own review.');
    return;
  }

  reviews.splice(index, 1); // Remove the review
  saveReviews(reviews);       // Update localStorage
  renderReviews();            // Re-render reviews and update overall score
}

// Handle form submission
document.getElementById('reviewForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get form values
  const name = document.getElementById('name').value;
  const rating = document.getElementById('rating').value;
  const reviewText = document.getElementById('review').value;

  // Validate rating selection
  if (!rating) {
    alert('Please select a rating.');
    return;
  }

  // Create a new review object (including a timestamp and the current user's ID)
  const newReview = {
    name,
    rating,
    review: reviewText,
    timestamp: new Date().toISOString(),
    userId: currentUserId,
  };

  // Save the new review and update the display
  const reviews = loadReviews();
  reviews.push(newReview);
  saveReviews(reviews);
  renderReviews();

  // Clear the form and reset star selection
  document.getElementById('reviewForm').reset();
  stars.forEach(star => star.classList.remove('selected'));
});

// Render reviews when the page loads
document.addEventListener('DOMContentLoaded', renderReviews);



  

