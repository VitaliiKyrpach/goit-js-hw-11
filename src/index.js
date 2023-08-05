import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38632948-8e8b89ba5a3d0480e3442823c';
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const showMore = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;
let queryCount = 0;

form.addEventListener('submit', onSearch);
showMore.addEventListener('click', addPage);
showMore.classList.add('is-hidden');

function onSearch(evt) {
  showMore.classList.add('is-hidden');
  gallery.innerHTML = '';
  evt.preventDefault();
  const search = evt.target.firstElementChild.value.trim();
  if (!search) return;
  getPhotos(search)
    .then(response => {
      if (!response.data.hits.length) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        form.reset();
      }
      if (response.data.total < 40) {
        showMore.classList.add('is-hidden');
      } else {
        showMore.classList.remove('is-hidden');
      }
      if (queryCount > 0) {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
      }
      gallery.insertAdjacentHTML('beforeend', createMarkUp(response.data));
      lightbox.refresh();
      queryCount += 1;
      // const { height: cardHeight } = document
      //   .querySelector('.gallery')
      //   .firstElementChild.getBoundingClientRect();
      // console.log(cardHeight);
    })
    .catch(error => {
      console.log(error);
    });
}

function getPhotos(search, pageNum = 1) {
  return axios.get(`${BASE_URL}`, {
    params: {
      key: API_KEY,
      q: search,
      page: pageNum,
      per_page: 40,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    },
  });
}

function createMarkUp(data) {
  return data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<a href="${largeImageURL}"><div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width='400' height='240'/>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
</div></a>`
    )
    .join('');
}

function addPage() {
  currentPage += 1;
  console.log(currentPage);
  const search = form.firstElementChild.value.trim();
  getPhotos(search, currentPage)
    .then(response => {
      gallery.insertAdjacentHTML('beforeend', createMarkUp(response.data));
      lightbox.refresh();
      if (
        currentPage ==
        Math.ceil(response.data.totalHits / response.data.hits.length)
      ) {
        showMore.classList.add('is-hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => {
      console.log(error);
    });
}
