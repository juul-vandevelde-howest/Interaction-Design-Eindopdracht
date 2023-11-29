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

const listenToClickGrid = function () {
  const buttons = document.querySelectorAll('.grid-artist');
  for (const button of buttons) {
    button.addEventListener('click', function () {
      const id = this.dataset.id;
      const name = this.dataset.name;
      console.log(id);
      console.log(name);
    });
  }
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
      img_urls.push(await getArtistImg(track.track.artists[0].id));
    }
    showGrid(data.tracks.items, img_urls);
  } catch (error) {
    console.error('Error:', error);
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
  listenToClickGrid();
};

const getArtistImg = async (id) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    const data = response.data;
    return data.images[0].url;
  } catch (error) {
    console.error('Error:', error);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  if (!localStorage.getItem('access_token')) {
    axios(authOptions)
      .then((response) => {
        localStorage.setItem('access_token', response.data.access_token);
        console.log('Access Token:', response.data.access_token);
      })
      .catch((error) => {
        console.error('Error fetching access token:', error.message);
      });
  }
  getGridData();
});
