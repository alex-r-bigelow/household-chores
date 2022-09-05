import { render } from './app.js';

const CLIENT_ID =
  '1065408495518-kmhvq7drlk415qa0al8nl3lgpdte6pui.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBg-Ub1hnzOjSeMr0g-qDVhA5eOtlgl3ok';
const DISCOVERY_DOC =
  'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

const appState = {
  tokenClient: null,
  gapiInited: false,
  gisInited: false,
  isLoggedIn: false,
  loadingError: null,
  allChores: null,
};
window.appState = appState;

function handleAuthClick() {
  appState.tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    appState.allChores = null;
    appState.isLoggedIn = true;
    render();
    await getChores();
  };

  const currentToken = gapi.client.getToken();
  if (currentToken === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    appState.tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    appState.tokenClient.requestAccessToken({ prompt: '' });
  }
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    appState.isLoggedIn = false;
    render();
  }
}

async function getChores() {
  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: '12AsuFHX5a2OJdzM_V5_TinTDT7ttFCVehpxhL-kUAjk',
      range: 'Chores List!A1:H',
    });
  } catch (err) {
    appState.loadingError = err;
    return;
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    appState.allChores = [];
    return;
  }
  const headers = range.values.shift();
  appState.allChores = range.values.map((row) =>
    row.reduce(
      (agg, value, index) => ({
        ...agg,
        [headers[index]]: value,
      }),
      {}
    )
  );
  render();
}

function setupButtonEvents() {
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');

  authorizeButton.addEventListener('click', handleAuthClick);
  signoutButton.addEventListener('click', handleSignoutClick);
}

window.addEventListener('load', () => {
  setupButtonEvents();
  render();
});
function gapiLoaded() {
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    appState.gapiInited = true;
    render();
  });
}
function gisLoaded() {
  appState.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  appState.gisInited = true;
  render();
}
window.addEventListener('DOMContentLoaded', () => {
  gapiLoaded();
  gisLoaded();
});
