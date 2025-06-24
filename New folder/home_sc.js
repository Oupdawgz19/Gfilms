const TMDB_KEY = '89b58596928c97c7afa8f23569b4d33b';
const TMDB = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';
const ANIME = 'https://api.jikan.moe/v4/anime';

async function fetchRandom(category, opts={}) {
  const page = Math.floor(Math.random() * opts.maxPage) + 1;
  const url = opts.isAnime
    ? `${ANIME}?page=${page}&limit=8`
    : `${TMDB}/${opts.path}?api_key=${TMDB_KEY}&page=${page}${opts.extra||''}`;
  const res = await fetch(url);
  const d = await res.json();
  return (d.results || d.data || []).slice(0, 6);
}

function display(containerId, movies, isAnime=false){
  const row = document.querySelector(`#${containerId} .movies-row`);
  row.innerHTML = movies.map(m => `
    <div class="movie">
      <img src="${m.poster_path||m.images?.jpg.image_url ? (isAnime ? m.images.jpg.image_url : IMG + m.poster_path) : 'https://via.placeholder.com/300x450'}" alt="">
      <div class="movie-info">
        <h4>${m.title||m.name}</h4>
        <span>${Math.round((m.vote_average || m.score)*10)/10}</span>
      </div>
    </div>`).join('');
}

async function init() {
  const upcoming = await fetchRandom('upcoming',{path:'movie/upcoming',maxPage:5});
  display('random-upcoming', upcoming);

  const kids = await fetchRandom('kids',{path:'discover/movie',maxPage:20,extra:'&with_genres=16'});
  display('random-kids', kids);

  const classic = await fetchRandom('classic',{path:'discover/movie',maxPage:30,extra:'&primary_release_date.lte=1980-01-01'});
  display('random-classic', classic);

  const anime = await fetchRandom('anime',{isAnime:true, maxPage:20});
  display('random-anime', anime, true);
}

init();