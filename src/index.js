import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('.search-form');
const inputEL = document.querySelector('[name=searchQuery]');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const API_KEY = '33083695-ddeedb70557ee618c67bd1e2e';
const BASE_URL = 'https://pixabay.com/api/';

let perPage = 40;
let page = 1;
let inputValue = null;

loadMoreBtn.style.display = 'none';

async function getFetch(inputValue) {
  return await axios.get(`${BASE_URL}`, {
    params: {
      q: inputValue,
      key: API_KEY,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: perPage,
      page,
    },
  });
}

formEl.addEventListener('submit', handlerOnSubmit);

async function handlerOnSubmit(e) {
  if (inputValue === inputEL.value.trim()) {
    return;
  }
  e.preventDefault();
  inputValue = inputEL.value.trim();

  galleryEl.innerHTML = '';

  if (inputValue === '') {
    galleryEl.innerHTML = '';
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info('Please enter search criteria');
    return;
  } else {
    getFetch(inputValue).then(({ data }) => {
      let totalPage = data.totalHits / perPage;

      if (data.hits.length > 0) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        createMarkup(data);
        new SimpleLightbox('.gallery a', {
          captionPosition: 'bottom',
          captionsData: 'alt',
          captionDelay: 250,
        });
      } else {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        galleryEl.innerHTML = '';
        return;
      }

      if (page < totalPage) {
        loadMoreBtn.style.display = 'block';
      }
    });
  }
}

function createMarkup(data) {
  const markup = data.hits
    .map(hit => {
      return `<div class="photo-card">
     <a class="gallery-item" href="${hit.largeImageURL}">
  <img src="${hit.webformatURL}" alt="${hit.tags}" width = 50 loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>${hit.likes}</b>
    </p>
    <p class="info-item">
      <b>${hit.views}</b>
    </p>
    <p class="info-item">
      <b>${hit.comments}</b>
    </p>
    <p class="info-item">
      <b>${hit.downloads}</b>
    </p>
  </div>
</div>`;
    })
    .join('');
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

loadMoreBtn.addEventListener('click', () => {
  console.log(inputValue);
  page += 1;
  getFetch(inputValue).then(({ data }) => {
    let totalPage = data.totalHits / perPage;
    createMarkup(data);
    if (page >= totalPage) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  });
});
