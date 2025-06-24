const TMDB_KEY = '89b58596928c97c7afa8f23569b4d33b';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const ANIME_API = 'https://api.jikan.moe/v4/anime?sfw';

const content = document.getElementById('content');
const form = document.getElementById('search-form');
const navLinks = document.querySelectorAll('.nav-links a');
const animeLink = document.getElementById('anime-link');

async function fetchMovies(url) {
  const resp = await fetch(url);
  const data = await resp.json();
  if(data.results) return data.results;
  return data.data || [];
}

const categories = [
    {
        id: 'upcoming-movies-list',
        queries: ['2025', '2024', '2026'], // Recently released or upcoming
    },
    {
        id: 'classics-movies-list',
        queries: ['The Godfather', 'Casablanca', 'Gone with the Wind', 'Citizen Kane'],
    },
    {
        id: 'kiddies-movies-list',
        queries: ['Toy Story', 'Frozen', 'Moana', 'Finding Nemo'],
    }
];

function renderMovies(movies) {
  content.innerHTML = '';
  movies.forEach(m => {
    const img = m.poster_path || m.images?.jpg.image_url;
    const title = m.title || m.name;
    const vote = m.vote_average || m.score;
    const overview = m.overview || (m.synopsis ? m.synopsis.slice(0,150)+'...' : '');
    const color = vote >= 8 ? 'green' : vote >= 5 ? 'orange' : 'red';
    content.innerHTML += `
      <div class="movie">
        <img src="${img ? (m.poster_path ? IMG_BASE + img : img) : 'https://via.placeholder.com/500x750'}" alt="${title}">
        <div class="movie-info"><h3>${title}</h3><span class="${color}">${vote}</span></div>
        <div class="overview">${overview}</div>
      </div>`;
  });
}

//FOR THE pages
let currentCategory = 'upcoming';
let currentPage = 1;
let totalPages = 5;

async function loadCategory(page = 1) {
  let url;
  if (currentCategory === 'anime') {
    url = `https://api.jikan.moe/v4/anime?page=${page}`;
  } else {
    const cat = {
      upcoming: 'movie/upcoming',
      kids: 'discover/movie?with_genres=16',
      classic: 'discover/movie?primary_release_date.lte=1980-01-01',
    }[currentCategory];
    url = `${TMDB_BASE}/${cat}?api_key=${TMDB_KEY}&page=${page}`;
  }
  const resp = await fetch(url);
  const data = await resp.json();
  const movies = data.results || data.data;
  totalPages = data.total_pages || data.pagination.last_visible_page;
  currentPage = data.page || page;
  renderMovies(movies);
  renderPagination();
}

function renderPagination() {
  const pag = document.getElementById('pagination');
  pag.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} id="prev">Previous</button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button ${currentPage === totalPages ? 'disabled' : ''} id="next">Next</button>
  `;
  document.getElementById('prev').onclick = () => loadCategory(currentPage - 1);
  document.getElementById('next').onclick = () => loadCategory(currentPage + 1);
}

// Hook nav-links and anime-link to update category then call loadCategory()
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    currentCategory = link.dataset.category;
    loadCategory(1);
  });
});
animeLink.addEventListener('click', e => {
  e.preventDefault();
  currentCategory = 'anime';
  loadCategory(1);
});
form.addEventListener('submit', e => {
  e.preventDefault();
  currentCategory = 'search';
  const q = document.getElementById('search-bar').value;
  loadCategory = async (page = 1) => {
    const resp = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${q}&page=${page}`);
    const data = await resp.json();
    totalPages = data.total_pages;
    currentPage = data.page;
    renderMovies(data.results);
    renderPagination();
  };
  loadCategory(1);
});

//closem

form.addEventListener('submit', e => {
  e.preventDefault();
  const q = document.getElementById('search-bar').value;
  if(q) fetchMovies(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${q}`)
      .then(renderMovies);
});

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = link.dataset.category;
    let url = '';
    if(cat === 'upcoming') url = `${TMDB_BASE}/movie/upcoming?api_key=${TMDB_KEY}`;
    else if(cat === 'kids') url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=16`;
    else if(cat === 'classic') url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&primary_release_date.lte=1980-01-01`;
    fetchMovies(url).then(renderMovies);
  });
});

animeLink.addEventListener('click', (e) => {
  e.preventDefault();
  fetchMovies(ANIME_API).then(renderMovies);
});

// Initialize with upcoming
fetchMovies(`${TMDB_BASE}/movie/upcoming?api_key=${TMDB_KEY}`).then(renderMovies);
