// #region ***  DOM references                           ***********
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
// #endregion

// #region ***  Callback-Visualisation - show___         ***********
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
// #endregion

// #region ***  Callback-No Visualisation - callback___  ***********
// #endregion

// #region ***  Data Access - get___                     ***********
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
  }
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
  }
};
// #endregion

// #region ***  Event Listeners - listenTo___            ***********
const listenToClickGrid = function (data, img_urls) {
  const body = document.querySelector('body');
  const dialog = document.querySelector('.modal');
  const closeBtn = document.querySelector('.close-btn');

  dialog.addEventListener('cancel', function () {
    body.classList.remove('dialog-open');
  });

  closeBtn.addEventListener('click', function () {
    dialog.close();
    body.classList.remove('dialog-open');
  });

  const buttons = document.querySelectorAll('.grid-artist');
  for (const button of buttons) {
    button.addEventListener('click', function () {
      const id = this.dataset.id;

      getArtist(id).then((artist_data) => {
        document.querySelector('.artist-followers').innerHTML = artist_data.followers.total;
        document.querySelector('.artist-popularity').innerHTML = artist_data.popularity;
      });

      const nr = this.dataset.nr;
      const name = this.dataset.name;
      document.querySelector('.artist-img').innerHTML = `<img src="${img_urls[nr - 1]}" alt="${name}">`;
      document.querySelector('.artist-name').innerHTML = name;
      document.querySelector('.artist-nr').innerHTML = nr;
      document.querySelector('.artist-genres').innerHTML = '';
      document.querySelector('.artist-song-img').innerHTML = `<img src="${data[nr - 1].track.album.images[0].url}" alt="Album cover for song: ${data[nr - 1].track.name}">`;
      document.querySelector('.artist-song-name').innerHTML = data[nr - 1].track.name;
      document.querySelector('.artist-song-preview').innerHTML = `<audio controls><source src="${data[nr - 1].track.preview_url}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
      dialog.showModal();
      body.classList.add('dialog-open');
    });
  }
};
// #endregion

// #region ***  Init / DOMContentLoaded                  ***********
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
// #endregion
