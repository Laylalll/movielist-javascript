// VARIABLE ////////////
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []
const MOVIES_PER_PAGE = 12
let currentPage = 1
let displayMode = JSON.parse(localStorage.getItem('defaultMode')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeSwitch = document.querySelector('#mode-switch')

// EXECUTING ////////////
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1), displayMode)
  })
  .catch((err) => console.log(err))

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMoviesByPage(page), displayMode)
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1), displayMode)
})

modeSwitch.addEventListener('click', function onModeSwitchClicked(event) {
  if (event.target.matches('#card-mode-button')) {
    switchMode('card-mode')
    renderMovieList(getMoviesByPage(currentPage), displayMode)
  } else if (event.target.matches('#list-mode-button')) {
    switchMode('list-mode')
    renderMovieList(getMoviesByPage(currentPage), displayMode)
  }
})

// FUNCTION ////////////
function switchMode(mode) {
  if (displayMode.includes(mode)) return
  localStorage.setItem('defaultMode', JSON.stringify(mode))
  displayMode = JSON.parse(localStorage.getItem('defaultMode'))
}

function renderPaginator(amount) {
  // 80 / 12 = 6...8 => 7頁
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  // page 1 = 0 ~ 11
  // page 2 = 12 ~ 23
  // page 3 = 24 ~ 35
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(item => item.id === id)) {
    return alert('此部電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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
