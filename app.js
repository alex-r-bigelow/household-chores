import {
  setupChore,
  updateChores,
  addChoreCheckboxListeners,
} from './chores.js';
import {
  setupShoppingItem,
  updateShoppingItems,
  addShoppingItemListeners,
} from './shoppingList.js';

export function redrawHeader() {
  const appState = window.appState;

  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const modeButton = document.getElementById('mode_button');
  const message = document.getElementById('message');

  if (!appState.gapiInited || !appState.gisInited) {
    authorizeButton.style.visibility = 'hidden';
    signoutButton.style.visibility = 'hidden';
    modeButton.style.visibility = 'hidden';
    message.innerHTML = 'Loading page...';
    return;
  }

  authorizeButton.style.visibility = 'visible';
  modeButton.style.visibility = 'visible';
  modeButton.innerText =
    appState.mode === window.modes.CHORES ? 'Shopping List' : 'Chores List';

  if (!appState.isLoggedIn) {
    authorizeButton.innerText = 'Sign in';
    signoutButton.style.visibility = 'visible';
    message.innerHTML = 'Currently signed out.';
  } else {
    authorizeButton.innerText = 'Refresh';
    signoutButton.style.visibility = 'visible';
    if (appState.loadingError) {
      message.innerHTML = loadingError.message;
    } else if (appState.allChores === null || appState.shoppingList === null) {
      message.innerHTML = 'Loading data...';
    } else {
      if (appState.mode === window.modes.CHORES) {
        message.innerHTML = 'Chores loaded';
      } else {
        message.innerHTML = 'Shopping list loaded';
      }
      if (appState.isRefreshing) {
        message.innerHTML = 'Refreshing list...';
      }
    }
  }
}

export function redrawList() {
  if (window.appState.mode === window.modes.CHORES) {
    updateChores();
  } else {
    updateShoppingItems();
  }
}

export function fullRender() {
  const appState = window.appState;

  const pageContent = document.getElementById('page_content');

  redrawHeader();

  if (
    !appState.gapiInited ||
    !appState.gisInited ||
    !appState.isLoggedIn ||
    appState.loadError ||
    appState.allChores === null ||
    appState.shoppingList === null
  ) {
    pageContent.innerHTML = '';
    return;
  }
  if (appState.mode === window.modes.CHORES) {
    if (appState.allChores.length === 0) {
      pageContent.innerHTML = 'No data found!';
    } else {
      pageContent.innerHTML = appState.allChores.map(setupChore).join('');
      addChoreCheckboxListeners();
    }
  } else {
    if (appState.shoppingList.length === 0) {
      pageContent.innerHTML = 'No data found!';
    } else {
      pageContent.innerHTML = appState.shoppingList
        .map(setupShoppingItem)
        .join('');
      addShoppingItemListeners();
    }
  }

  redrawList();
}
