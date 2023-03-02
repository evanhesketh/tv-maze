"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
// const searchFormTerm = $('#searchForm-term').val();
const $episodesList = $('#episodesList');


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchFormTerm) {
    // $searchForm.val(''); // global scope

  const response = await axios.get('http://api.tvmaze.com/search/shows',
    { params: { q: searchFormTerm } });
  console.log(response);

  const shows = [];
  const showsDataFromResponse = response.data;

  for (const showAndScore of showsDataFromResponse) { //TODO: consider refactoring using map
    const { id, name, summary } = showAndScore.show;
    const image = showAndScore.show.image !== null
      ? showAndScore.show.image.medium
      : "https://tinyurl.com/tv-missing";

    shows.push({ id, name, summary, image });
    console.log("shows=", shows);
  }
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`); //make into base url global constant
  const responseData = response.data;

  const episodes = responseData.map(({ id, name, season, number }) => {
    return { id, name, season, number };
  });

  console.log('episodes, ', episodes);
  return episodes;
}

/** populateEpisodes: makes episodes-area visibile
 * appends each episode from passing in episodes array to the list
 * in episodes-list
 */
//empty, fill, show
function populateEpisodes(episodes) {
  $episodesArea.css('display', 'block'); //use .show()
//empty current list
  console.log("episodes=", episodes);
  //populate the #episodesList with the array of episodes
  for (const episode of episodes) {
    $episodesList.append(
      $(`<li>
        name: ${episode.name},
        season: ${episode.season},
        number: ${episode.number}
      </li>`));
  }
}

/** handleClickOnEpisodes: retrieves show ID from relevent show
 * calls getEpisodesOfShow to retrieve an array of episodes
 * calls populateEpisodes, passing in the return episodes array
 */
async function handleClickOnEpisodes(evt) {
  const id = $(evt.target).closest('.Show').data("show-id");
  console.log('id, ', id);

  const episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}

$showsList.on('click', 'button', handleClickOnEpisodes); // change button to more specific selector
$('#searchForm-term').val('');

