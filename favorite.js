// VARIABLE ////////////
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
let displayMode = JSON.parse(localStorage.getItem('defaultMode')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const modeSwitch = document.querySelector('#mode-switch')

// EXECUTING ////////////
renderMovieList(movies, displayMode)

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

modeSwitch.addEventListener('click', function onModeSwitchClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    switchMode('card-mode')
    renderMovieList(movies, displayMode)
  } else if (event.target.matches('#list-mode-button')) {
    switchMode('list-mode')
    renderMovieList(movies, displayMode)
  }
})

// FUNCTION ////////////
function switchMode(mode) {
  if (displayMode.includes(mode)) return
  localStorage.setItem('defaultMode', JSON.stringify(mode))
  displayMode = JSON.parse(localStorage.getItem('defaultMode'))
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return // 錯誤處理

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return // 錯誤處理

  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies, displayMode)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 先清空，避免載入下個資訊時，留下上個資料的殘影
  modalTitle.textContent = ''
  modalImage.innerHTML = ''
  modalDate.textContent = ''
  modalDescription.textContent = ''

  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.textContent = data.title
      modalDate.textContent = 'release date:' + data.release_date
      modalDescription.textContent = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="Movie Poster" class="img-fluid"></img>`
    })
}

function renderMovieList(data, mode) {
  let rawHTML = ''

  if (!mode.length || mode === 'card-mode') {
    data.forEach((item) => {
      // title、image、id
      rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
        </div>`
    })
  } else if (mode === 'list-mode') {
    rawHTML += `
      <div class="mb-2">
        <ul class="list-group list-group-flush">
      `
    data.forEach((item) => {
      // title、id
      rawHTML += `
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <div class="list-title">
              ${item.title}
            </div>
            <div>
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
                data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </li>
        `
    })
    rawHTML += `
        </ul>  
      <div>
    `
  }

  dataPanel.innerHTML = rawHTML
}