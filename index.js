import { fullRender, redrawHeader, redrawList } from './app.js';

const CLIENT_ID =
  '1065408495518-kmhvq7drlk415qa0al8nl3lgpdte6pui.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBg-Ub1hnzOjSeMr0g-qDVhA5eOtlgl3ok';
const DISCOVERY_DOC =
  'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
import {
  ALL_CHORE_CATEGORIES,
  ALL_STORES,
  MODES,
  PRIORITIES,
} from './constants.js';

const appState = {
  tokenClient: null,
  gapiInited: false,
  gisInited: false,
  isLoggedIn: false,
  loadingError: null,
  refreshingCount: null,
  allChores: null,
  shoppingList: null,
  mode: MODES.CHORES,
  filters: {
    choreCategory: ALL_CHORE_CATEGORIES,
    shoppingListPriority: PRIORITIES.NEED,
    shoppingListStore: ALL_STORES,
  },
};
window.appState = appState;

function handleAuthClick() {
  appState.tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    appState.allChores = null;
    appState.isLoggedIn = true;
    fullRender();
    await refreshData();
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
    fullRender();
  }
}

function responseToObjectList(response) {
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    return [];
  }
  const headers = range.values.shift();
  return range.values.map((row) =>
    row.reduce(
      (agg, value, index) => ({
        ...agg,
        [headers[index]]: value,
      }),
      {}
    )
  );
}

async function refreshData() {
  let choresResponse, shoppingResponse;
  try {
    [choresResponse, shoppingResponse] = await Promise.all([
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '12AsuFHX5a2OJdzM_V5_TinTDT7ttFCVehpxhL-kUAjk',
        range: 'Chores List!A1:I',
      }),
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '12AsuFHX5a2OJdzM_V5_TinTDT7ttFCVehpxhL-kUAjk',
        range: 'Shopping List!A1:D',
      }),
    ]);
  } catch (err) {
    appState.loadingError = err;
    appState.allChores = null;
    appState.shoppingList = null;
    fullRender();
    return;
  }
  appState.allChores = responseToObjectList(choresResponse);
  appState.shoppingList = responseToObjectList(shoppingResponse);
  fullRender();
}

window.startDelayedRefresh = (seconds = 5) => {
  window.clearTimeout(window.refreshTimeout);
  if (seconds === 0) {
    appState.refreshingCount = null;
    refreshData();
  } else {
    appState.refreshingCount = seconds;
    redrawHeader();
    window.refreshTimeout = window.setTimeout(() => {
      window.startDelayedRefresh(seconds - 1);
    }, 1000);
  }
};

window.updateChoreCompletedDate = async function (rowNumber, completedDate) {
  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: '12AsuFHX5a2OJdzM_V5_TinTDT7ttFCVehpxhL-kUAjk',
      range: `Chores List!G${rowNumber + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[completedDate]] },
    });
  } catch (err) {
    appState.loadingError = err;
    fullRender();
    return;
  }
  window.startDelayedRefresh();
};

window.updateShoppingListItemPriority = async function (
  rowNumber,
  priorityString
) {
  let response;
  try {
    response = await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: '12AsuFHX5a2OJdzM_V5_TinTDT7ttFCVehpxhL-kUAjk',
      range: `Shopping List!D${rowNumber + 2}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [[priorityString]] },
    });
  } catch (err) {
    appState.loadingError = err;
    fullRender();
    return;
  }
  window.startDelayedRefresh();
};

function setupButtonEvents() {
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const modeButton = document.getElementById('mode_button');

  authorizeButton.addEventListener('click', handleAuthClick);
  signoutButton.addEventListener('click', handleSignoutClick);
  modeButton.addEventListener('click', () => {
    if (appState.mode === MODES.CHORES) {
      appState.mode = MODES.SHOPPING_LIST;
    } else {
      appState.mode = MODES.CHORES;
    }
    fullRender();
  });
}

window.handleFilterChange = function () {
  const filters_nav = document.getElementById('filters_nav');
  filters_nav.querySelectorAll('[data-filter]').forEach((filterFormElement) => {
    appState.filters[filterFormElement.dataset.filter] =
      filterFormElement.value;
  });
  redrawHeader();
  redrawList();
};

window.addEventListener('load', () => {
  setupButtonEvents();
  fullRender();
});
function gapiLoaded() {
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    appState.gapiInited = true;
    fullRender();
  });
}
function gisLoaded() {
  appState.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  appState.gisInited = true;
  fullRender();
}
window.addEventListener('DOMContentLoaded', () => {
  gapiLoaded();
  gisLoaded();
});
