const clientId = 'fa36bb52f10c4f928a602c548cd57bdf';
const clientSecret = '830a8eb690404b52b8fb9dde45765317';
const authOptions = {
  method: 'POST',
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  data: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
};
let currentlyPlaying;

const listenToClickGrid = function (data, img_urls) {
  const body = document.querySelector('body');
  const dialog = document.querySelector('.modal');
  const closeBtn = document.querySelector('.close-btn');
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');

  dialog.addEventListener('cancel', function () {
    stopMedia();
    document.querySelector('.artist-followers-fill').style.width = '0%';
    document.querySelector('.artist-popularity-fill').style.width = '0%';
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    let element = document.querySelector('body.dialog-open');
    element.style.position = '';
    element.style.bottom = '';
    element.style.left = '';
    element.style.right = '';
    element.style.top = '';
    document.querySelector(`[data-nr="${current_nr}"]`).scrollIntoView();
    body.classList.remove('dialog-open');
    dialog.close();
  });

  closeBtn.addEventListener('click', function () {
    stopMedia();
    document.querySelector('.artist-followers-fill').style.width = '0%';
    document.querySelector('.artist-popularity-fill').style.width = '0%';
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    let element = document.querySelector('body.dialog-open');
    element.style.position = '';
    element.style.bottom = '';
    element.style.left = '';
    element.style.right = '';
    element.style.top = '';
    document.querySelector(`[data-nr="${current_nr}"]`).scrollIntoView();
    body.classList.remove('dialog-open');
    dialog.close();
  });

  nextBtn.addEventListener('click', function () {
    stopMedia();
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    let next_nr = parseInt(current_nr) + 1;
    if (next_nr > 50) {
      next_nr = 1;
    }
    const next_id = data[next_nr - 1].track.artists[0].id;
    const next_name = data[next_nr - 1].track.artists[0].name;
    showModal(data, img_urls, next_id, next_nr, next_name);
  });

  prevBtn.addEventListener('click', function () {
    stopMedia();
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    let prev_nr = parseInt(current_nr) - 1;
    if (prev_nr < 1) {
      prev_nr = 50;
    }
    const prev_id = data[prev_nr - 1].track.artists[0].id;
    const prev_name = data[prev_nr - 1].track.artists[0].name;
    showModal(data, img_urls, prev_id, prev_nr, prev_name);
  });

  const buttons = document.querySelectorAll('.grid-artist');
  for (const button of buttons) {
    button.addEventListener('click', function () {
      const id = this.dataset.id;
      const nr = this.dataset.nr;
      const name = this.dataset.name;
      showModal(data, img_urls, id, nr, name);
      dialog.showModal();
      body.classList.add('dialog-open');
      let element = document.querySelector('body.dialog-open');
      element.style.position = 'fixed';
      element.style.bottom = '0';
      element.style.left = '0';
      element.style.right = '0';
      element.style.top = '0';
    });
  }
};

const showModal = (data, img_urls, id, nr, name) => {
  getArtist(id).then((artist_data) => {
    if (artist_data.genres.length === 0) {
      document.querySelector('.artist-genres').innerHTML = 'No genres available';
    } else {
      document.querySelector('.artist-genres').innerHTML = artist_data.genres.join(', ');
    }
    document.querySelector('.artist-followers-data').innerHTML = artist_data.followers.total.toLocaleString();
    document.querySelector('.artist-followers-fill').style.width = (artist_data.followers.total / 115663373) * 100 + '%';
    document.querySelector('.artist-popularity-data').innerHTML = artist_data.popularity + '%';
    document.querySelector('.artist-popularity-fill').style.width = artist_data.popularity + '%';
  });

  document.querySelector('.artist-img').innerHTML = `<img src="${img_urls[nr - 1]}" alt="${name}">`;
  document.querySelector('.artist-name').innerHTML = name;
  document.querySelector('.artist-nr').innerHTML = nr;
  document.querySelector('.artist-song-img').innerHTML = `<img src="${data[nr - 1].track.album.images[1].url}" alt="Album cover for song: ${data[nr - 1].track.name}">`;
  document.querySelector('.artist-song-name').innerHTML = data[nr - 1].track.name;
  document.querySelector('.artist-song-preview').innerHTML = `
  <button title="Play/Stop Preview" aria-label="auto" aria-live="polite" class="o-button-reset toggle js-toggle">
    <svg class="icon icon--play" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#1db954" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm36.44,110.66-48,32A8.05,8.05,0,0,1,112,168a8,8,0,0,1-8-8V96a8,8,0,0,1,12.44-6.66l48,32a8,8,0,0,1,0,13.32Z"></path>
    </svg>
    <div class="icon icon--stop icon--progressbar"></div>
    <svg class="icon icon--stop" xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#1db954" viewBox="0 0 256 256">
        <path d="M128,212Zm32-104v40a12,12,0,0,1-12,12H108a12,12,0,0,1-12-12V108a12,12,0,0,1,12-12h40A12,12,0,0,1,160,108Z"></path>
    </svg>
</button>`;
  playMusic(data[nr - 1].track.preview_url);
};

const playMusic = (preview_url) => {
  const toggle = document.querySelector('.js-toggle');
  const icon = document.querySelector('.icon--progressbar');
  const music = new Audio(preview_url);
  if (preview_url === null) {
    toggle.classList.add('disabled');
    toggle.setAttribute('disabled', true);
    toggle.setAttribute('aria-disabled', true);
    toggle.setAttribute('aria-label', 'No preview available');
  }
  currentlyPlaying = music;
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('added');
    icon.classList.toggle('animate');
    if (icon.classList.contains('animate')) {
      document.querySelector('.animate').addEventListener('animationend', function () {
        toggle.classList.remove('added');
        icon.classList.remove('animate');
      });
    }
    if (toggle.classList.contains('added')) {
      music.play();
    } else {
      music.pause();
      music.currentTime = 0;
    }
  });
};

const stopMedia = () => {
  currentlyPlaying.pause();
  currentlyPlaying.currentTime = 0;
};

const getGridData = async () => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    const data = response.data;
    let img_urls_small = [];
    let img_urls_big = [];
    for (const track of data.tracks.items) {
      const data = await getArtist(track.track.artists[0].id);
      img_urls_small.push(data.images[1].url);
      img_urls_big.push(data.images[0].url);
    }
    showGrid(data.tracks.items, img_urls_small, img_urls_big);
    document.querySelector('.loader').classList.add('u-hidden');
    document.querySelector('.js-container').classList.remove('u-hidden');
  } catch (error) {
    console.error('Error:', error);
    localStorage.removeItem('access_token');
  }
};

const listenToBonus = () => {
  const bonus = document.querySelector('.grid-bonus');
  bonus.addEventListener('click', function () {
    showModalBonus();
    document.querySelector('body').classList.add('dialog-open');
    let element = document.querySelector('body.dialog-open');
    element.style.position = 'fixed';
    element.style.bottom = '0';
    element.style.left = '0';
    element.style.right = '0';
    element.style.top = '0';
  });
};

const showModalBonus = () => {
  const bonusDialog = document.querySelector('.modal');
  const video = document.querySelector('.bonus');
  const body = document.querySelector('body');
  const artist = document.querySelector('.artist');
  const changeArtistBtns = document.querySelector('.change-artist-btns');
  bonusDialog.showModal();
  document.querySelector('.artist-nr').innerHTML = '?';
  video.classList.remove('u-hidden');
  artist.classList.add('u-hidden');
  changeArtistBtns.classList.add('u-hidden');
  video.play();
  currentlyPlaying = video;
  document.querySelector('.close-btn').addEventListener('click', function () {
    bonusDialog.close();
    stopMedia();
    artist.classList.remove('u-hidden');
    video.classList.add('u-hidden');
    changeArtistBtns.classList.remove('u-hidden');
    body.classList.remove('dialog-open');
  });
  bonusDialog.addEventListener('cancel', function () {
    bonusDialog.close();
    stopMedia();
    artist.classList.remove('u-hidden');
    video.classList.add('u-hidden');
    changeArtistBtns.classList.remove('u-hidden');
    body.classList.remove('dialog-open');
  });
};

const showGrid = (data, img_urls_small, img_urls_big) => {
  let html = '';
  let i = 0;
  console.info(data);
  img_urls_small.forEach((url) => {
    i++;
    html += `<button class="grid-artist o-button-reset" data-nr="${i}" data-name="${data[i - 1].track.artists[0].name}" data-id="${data[i - 1].track.artists[0].id}">
            <img src="${url}" alt="${data[i - 1].track.artists[0].name}">
        </button>`;
  });
  html += `<button class="grid-bonus o-button-reset" data-nr="?" data-name="Bonus Artist"">
  <img class="bonus-img" src="./img/the-halal-design-studio-HK06CdtW2rg-unsplash.jpg" alt="Bonus Artist">
</button>`;
  document.querySelector('.js-container').innerHTML = html;
  listenToClickGrid(data, img_urls_big);
  listenToTooltip();
  listenToBonus();
};

const listenToTooltip = () => {
  document.body.addEventListener('touchstart', function (e) {
    // get the element that is in focus
    var activeElement = document.activeElement;
    // if the activeElement has the class tooltip
    if (activeElement.classList.contains('tooltip')) {
      // if the touch was not on the activeElement
      if (e.target !== activeElement) {
        // remove focus from activeElement
        activeElement.blur();
      }
    }
  });
};

const getArtist = async (id) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error:', error);
    localStorage.removeItem('access_token');
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if (!localStorage.getItem('access_token')) {
    axios(authOptions)
      .then((response) => {
        localStorage.setItem('access_token', response.data.access_token);
        getGridData();
      })
      .catch((error) => {
        console.error('Error fetching access token:', error.message);
      });
  } else {
    getGridData();
  }
});
