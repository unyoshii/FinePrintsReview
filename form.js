// Import Firebase modules (Ensure this is in a module script)
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================================================
// ================  FIREBASE SETUP  ===================
// =====================================================

// 🔹 Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAComGCasroxvaETCeJ8HH3lFiEr9y92o8",
  authDomain: "fineprintsreviews.firebaseapp.com",
  projectId: "fineprintsreviews",
  storageBucket: "fineprintsreviews.appspot.com",  // ✅ Corrected storageBucket
  messagingSenderId: "59498916202",
  appId: "1:59498916202:web:088089140a347b3c9d9d13",
  measurementId: "G-CBEM49814Z"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =====================================================
// ============  SIMPLE USER "AUTH" LOGIC  =============
// =====================================================
// NOTE: This is NOT a secure method. It's only a demo for
// "delete your own review" functionality.

let userId = localStorage.getItem("userId");
if (!userId) {
  // Generate a random user ID
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}
console.log("Your local userId:", userId);

// =====================================================
// ===========  ADD & DISPLAY REVIEWS LOGIC  ===========
// =====================================================

// 🔹 Function to Add Review to Firestore
async function addReview(name, rating,reviewText)
{
  try 
  {
    await addDoc(collection(db,"reviews"),{
      userId,
      name,
      rating,
      review: reviewText,
      timestamp: new Date()

    });
    console.log ("Review added!");
  } catch (error)
  {
    console.log("Error adding review: ", error);
  }
}


// 🔹 Function to Remove a Review (if it belongs to the user)
async function removeReview(docId) {
  const confirmDelete = confirm("Are you sure you want to delete this review?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "reviews", docId));
    console.log("Review deleted!");
  } catch (error) {
    console.error("Error deleting review: ", error);
  }
}

// 🔹 Function to Fetch Reviews in Real-Time and Display
function loadReviews() {
  onSnapshot(collection(db, "reviews"), (snapshot) => {
    const reviewsList = document.getElementById("reviewsList");
    reviewsList.innerHTML = ""; // Clear existing reviews

    snapshot.forEach((docSnap) => {
      const reviewData = docSnap.data();
      const docId = docSnap.id;  // Firestore document ID
      const { name, rating, review, timestamp, userId: reviewerId } = reviewData;

      // Convert timestamp to a readable date/time
      let dateTimeString = "";
      if (timestamp) {
        // Firestore timestamp objects have a .toDate() method
        const dateObj = timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);
        dateTimeString = dateObj.toLocaleString();
      }

      // Create the review "card"
      const reviewElement = document.createElement("div");
      reviewElement.classList.add("review-item");
      reviewElement.innerHTML = `
        <div class="review-header">
          <h3 class="review-name">${name}</h3>
          <span class="review-date">${dateTimeString}</span>
        </div>
        <div class="review-rating">${"★".repeat(rating)}</div>
        <p>${review}</p>
      `;

      // Only show "Delete" button if the review belongs to this user
      if (reviewerId === userId) {
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => removeReview(docId));
        reviewElement.appendChild(deleteBtn);
      }

      reviewsList.appendChild(reviewElement);
    });
  });
}

// =====================================================
// ==============  FORM & STAR RATING LOGIC  ===========
// =====================================================

// 🔹 Handle Form Submission
document.getElementById("reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const rating = parseInt(document.getElementById("rating").value);
  const reviewText = document.getElementById("review").value;

  if (name && rating && reviewText) {
    addReview(name, rating, reviewText);
    document.getElementById("reviewForm").reset();
  }
});

// 🔹 Handle Star Rating Selection
const starSpans = document.querySelectorAll(".star-rating span");
starSpans.forEach((star) => {
  star.addEventListener("click", function () {
    const ratingValue = +this.getAttribute("data-value");
    document.getElementById("rating").value = ratingValue;

    // Reset all stars to default (☆)
    starSpans.forEach((s) => {
      s.innerHTML = "☆";
      s.classList.remove("filled");
    });

    // Fill up to the chosen rating
    for (let i = 0; i < ratingValue; i++) {
      starSpans[i].innerHTML = "★";
      starSpans[i].classList.add("filled");
    }
  });
});

// 🔹 Load Reviews on Page Load
loadReviews();
