const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const statusText = document.getElementById("status");

const gridBtn = document.getElementById("gridBtn");
const listBtn = document.getElementById("listBtn");
const sortSelect = document.getElementById("sortSelect");

let debounceTimer;
let usersData = [];
let currentView = "grid";

/* ---------- VIEW TOGGLE ---------- */
gridBtn.onclick = () => setView("grid");
listBtn.onclick = () => setView("list");

function setView(view) {
  currentView = view;
  results.className = `results ${view}`;
  gridBtn.classList.toggle("active", view === "grid");
  listBtn.classList.toggle("active", view === "list");
}

/* ---------- SORT ---------- */
sortSelect.onchange = () => sortUsers();

function sortUsers() {
  let sorted = [...usersData];

  if (sortSelect.value === "followers") {
    sorted.sort((a, b) => b.followers - a.followers);
  } else if (sortSelect.value === "repos") {
    sorted.sort((a, b) => b.public_repos - a.public_repos);
  } else {
    sorted.sort((a, b) => a.login.localeCompare(b.login));
  }

  renderUsers(sorted);
}

/* ---------- SEARCH WITH DEBOUNCE ---------- */
input.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const query = input.value.trim();
    if (query) fetchUsers(query);
    else {
      results.innerHTML = "";
      statusText.textContent = "";
    }
  }, 600);
});

/* ---------- FETCH USERS ---------- */
async function fetchUsers(query) {
  statusText.textContent = "Loading...";
  results.innerHTML = "";
  usersData = [];

  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${query}&per_page=12`
    );
    if (!res.ok) throw new Error("API Error");

    const data = await res.json();

    // fetch detailed user info (followers, repos)
    const detailedUsers = await Promise.all(
      data.items.map(user =>
        fetch(user.url).then(res => res.json())
      )
    );

    usersData = detailedUsers;
    statusText.textContent = `Found ${usersData.length} users`;

    sortUsers();

  } catch {
    statusText.textContent = "Something went wrong!";
  }
}

/* ---------- RENDER ---------- */
function renderUsers(users) {
  results.innerHTML = "";
  results.className = `results ${currentView}`;

  users.forEach(user => {
    const card = document.createElement("div");
    card.className = "user";

    card.innerHTML = `
      <div class="user-left">
        <img src="${user.avatar_url}">
        <div>
          <h3>${user.name || user.login}</h3>
          <span>@${user.login}</span>
        </div>
      </div>

      <div style="display:flex; gap:25px; margin:15px 0;">
        <div>👥 ${user.followers}</div>
        <div>📦 ${user.public_repos}</div>
      </div>

      <a href="${user.html_url}" target="_blank">View Profile →</a>
    `;

    results.appendChild(card);
  });
}

/* DEFAULT VIEW */
setView("grid");

