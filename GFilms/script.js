
//API for the anime
const query = `
  query ($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
        }
      }
    }
  }
`;

const variables = {
  page: 1,
  perPage: 5
};

fetch('https://graphql.anilist.co', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query,
    variables
  })
})
  .then(response => response.json())
  .then(data => {
    const animeList = data.data.Page.media;
    animeList.forEach(anime => {
      console.log(`Title: ${anime.title.romaji}`);
      console.log(`English Title: ${anime.title.english}`);
      console.log(`Cover Image: ${anime.coverImage.large}`);
      console.log('---');
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });


//APi for Movie
  const API_KEY = 'YOUR_TMDB_API_KEY';
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';
const SEARCH_URL = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;

const form = document.getElementById('form');
const search = document.getElementById('search');
const main = document.getElementById('main');

// Fetch and show movies
async function getMovies(url) {
  const resp = await fetch(url);
  const data = await resp.json();
  showMovies(data.results);
}

function showMovies(movies) {
  main.innerHTML = '';
  movies.forEach(movie => {
    const { title, poster_path, vote_average, overview } = movie;
    const el = document.createElement('div');
    el.classList.add('movie');
    el.innerHTML = `
      <img src="${poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750'}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview"><h3>Overview</h3>${overview}</div>`;
    main.appendChild(el);
  });
}

function getClassByRate(vote) {
  return vote >= 8 ? 'green' : vote >= 5 ? 'orange' : 'red';
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const term = search.value;
  if (term) {
    getMovies(SEARCH_URL + term);
    search.value = '';
  } else {
    getMovies(API_URL);
  }
});

// Initialize with popular movies
getMovies(API_URL);