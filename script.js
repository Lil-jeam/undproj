const API_URL = "https://apps.und.edu/demo/public/index.php/post";
const postListElement = document.getElementById("post-list");
const searchInput = document.getElementById("post-search");
const showMoreBtn = document.getElementById("show-more-btn");
const spinner = document.getElementById("loading-spinner");

let allPosts = [];
let currentIndex = 0;
const POSTS_PER_PAGE = 15;

// Toggle mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const icon = document.getElementById("hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Returns the date 'n' days ago in YYYY-MM-DD format
function getDateNDaysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

// Fetch posts in 3-day chunks, total of 9 days
async function fetchPosts() {
  spinner.hidden = false; // Show spinner

  try {
    for (let i = 0; i < 9; i += 3) {
      const from = getDateNDaysAgo(i + 2);
      const to = getDateNDaysAgo(i);
      const url = `${API_URL}?from=${from}&to=${to}`;

      const res = await fetch(url);
      const data = await res.json();
      allPosts = allPosts.concat(data);
    }

    renderPosts(allPosts);
  } catch (err) {
    console.error("Failed to fetch posts", err);
  } finally {
    spinner.hidden = true; // Hide spinner
  }
}

// Convert UTC time to user-local time
function formatToLocal(dateString) {
  const localDate = new Date(dateString);
  return localDate.toLocaleString();
}

// Render initial or filtered posts
function renderPosts(posts) {
  postListElement.innerHTML = "";
  currentIndex = 0;
  loadNextPosts(posts);

  showMoreBtn.hidden = posts.length <= POSTS_PER_PAGE;
  if (posts.length === 0) {
    const noPostsMessage = document.createElement("div");
    noPostsMessage.className = "no-posts-message";
    noPostsMessage.textContent = "No posts found. Try searching for something else!";
    postListElement.appendChild(noPostsMessage);
  }
}

// Load next batch of posts
function loadNextPosts(posts) {
  const nextPosts = posts.slice(currentIndex, currentIndex + POSTS_PER_PAGE);

  nextPosts.forEach((post) => {
    const postCard = document.createElement("div");
    postCard.className = "post-card";
    postCard.innerHTML = `
      <div class="post-header">
        <img src="${post.image}" alt="${post.author}'s avatar" class="avatar" />
        <div>
          <strong>${post.author}</strong><br/>
          <small>@${post.username} from ${post.location}</small>
        </div>
      </div>
      <p class="post-message">${post.message}</p>
      <div class="post-footer">
        <span>${formatToLocal(post.date)}</span>
        <span>❤️ ${post.likes} &nbsp;&nbsp; 🔁 ${post.reposts}</span>
      </div>
    `;
    postListElement.appendChild(postCard);
  });

  currentIndex += POSTS_PER_PAGE;

  if (currentIndex >= posts.length) {
    showMoreBtn.hidden = true;
  } else {
    showMoreBtn.hidden = false;
  }
}

// Show More button click handler
showMoreBtn.addEventListener("click", () => {
  loadNextPosts(allPosts);
});

// Live search filter
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  const filtered = allPosts.filter((post) =>
    post.message.toLowerCase().includes(term)
  );
  renderPosts(filtered);
});

// Set current year in footer
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// Initial load
fetchPosts();
