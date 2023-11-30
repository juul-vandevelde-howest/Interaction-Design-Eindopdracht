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

const listenToClickGrid = function (data, img_urls) {
  const body = document.querySelector('body');
  const dialog = document.querySelector('.modal');
  const closeBtn = document.querySelector('.close-btn');
  const nextBtn = document.querySelector('.next-btn');
  const prevBtn = document.querySelector('.prev-btn');

  dialog.addEventListener('cancel', function () {
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    document.querySelector(`[data-nr="${current_nr}"]`).scrollIntoView();
    body.classList.remove('dialog-open');
  });

  closeBtn.addEventListener('click', function () {
    const current_nr = document.querySelector('.artist-nr').innerHTML;
    document.querySelector(`[data-nr="${current_nr}"]`).scrollIntoView();
    dialog.close();
    body.classList.remove('dialog-open');
  });

  nextBtn.addEventListener('click', function () {
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
    });
  }
};

const showModal = (data, img_urls, id, nr, name) => {
  getArtist(id).then((artist_data) => {
    document.querySelector('.artist-genres').innerHTML = artist_data.genres.join(', ');
    document.querySelector('.artist-followers-data').innerHTML = artist_data.followers.total.toLocaleString();
    document.querySelector('.artist-followers-fill').style.width = (artist_data.followers.total / 115663373) * 100 + '%';
    document.querySelector('.artist-popularity-data').innerHTML = artist_data.popularity + '%';
    document.querySelector('.artist-popularity-fill').style.width = artist_data.popularity + '%';
  });

  document.querySelector('.artist-img').innerHTML = `<img src="${img_urls[nr - 1]}" alt="${name}">`;
  document.querySelector('.artist-name').innerHTML = name;
  document.querySelector('.artist-nr').innerHTML = nr;
  document.querySelector('.artist-song-img').innerHTML = `<img src="${data[nr - 1].track.album.images[0].url}" alt="Album cover for song: ${data[nr - 1].track.name}">`;
  document.querySelector('.artist-song-name').innerHTML = data[nr - 1].track.name;
  listenToPlayMusic(data[nr - 1].track.preview_url);
};

const listenToPlayMusic = (preview_url) => {
  const toggle = document.querySelector('.js-toggle');
  const icon = document.querySelector('.icon--progressbar');
  const music = new Audio(preview_url);
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

const getGridData = async () => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    const data = response.data;
    let img_urls = [];
    for (const track of data.tracks.items) {
      const data = await getArtist(track.track.artists[0].id);
      img_urls.push(data.images[0].url);
    }
    showGrid(data.tracks.items, img_urls);
  } catch (error) {
    console.error('Error:', error);
    localStorage.removeItem('access_token');
  }
};

const showGrid = (data, img_urls) => {
  let html = '';
  let i = 0;
  console.info(data);
  img_urls.forEach((url) => {
    i++;
    html += `<button class="grid-artist o-button-reset" data-nr="${i}" data-name="${data[i - 1].track.artists[0].name}" data-id="${data[i - 1].track.artists[0].id}">
            <img src="${url}" alt="${data[i - 1].track.artists[0].name}">
        </button>`;
  });
  document.querySelector('.js-container').innerHTML = html;
  listenToClickGrid(data, img_urls);
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
