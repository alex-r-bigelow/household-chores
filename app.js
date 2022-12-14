import { MODES } from './constants.js';
import {
  setupChore,
  updateChores,
  addChoreCheckboxListeners,
  renderChoreFilters,
} from './chores.js';
import {
  setupShoppingItem,
  updateShoppingItems,
  addShoppingItemListeners,
  renderShoppingListFilters,
} from './shoppingList.js';

export function redrawHeader() {
  const appState = window.appState;

  const header = document.getElementById('header');
  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const modeButton = document.getElementById('mode_button');
  const filtersNav = document.getElementById('filters_nav');
  const message = document.getElementById('message');

  header.className = '';

  if (!appState.gapiInited || !appState.gisInited) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'none';
    modeButton.style.display = 'none';
    filtersNav.style.display = 'none';
    message.innerHTML = 'Loading page...';
    return;
  }

  header.classList.add('loaded');
  authorizeButton.style.display = null;

  if (!appState.isLoggedIn) {
    authorizeButton.innerText = 'Sign in';
    signoutButton.style.display = null;
    modeButton.style.display = 'none';
    filtersNav.style.display = 'none';
    message.innerHTML = 'Currently signed out.';
  } else {
    authorizeButton.innerText = 'Refresh';
    if (appState.loadingError) {
      message.innerHTML = loadingError.message;
      modeButton.style.display = 'none';
      filtersNav.style.display = 'none';
    } else if (appState.allChores === null || appState.shoppingList === null) {
      message.innerHTML = 'Loading data...';
      modeButton.style.display = 'none';
      filtersNav.style.display = 'none';
    } else {
      modeButton.style.display = null;
      filtersNav.style.display = null;
      if (appState.mode === MODES.CHORES) {
        header.classList.add('chores');
        message.innerHTML = 'Chores loaded';
        modeButton.innerText = 'Shopping List';
        filtersNav.innerHTML = renderChoreFilters();
      } else {
        header.classList.add('shoppingList');
        message.innerHTML = 'Shopping list loaded';
        modeButton.innerText = 'Chores List';
        filtersNav.innerHTML = renderShoppingListFilters();
      }
      if (appState.refreshingCount) {
        message.innerHTML = `Refreshing in ${appState.refreshingCount}...`;
      }
    }
  }
}

export function redrawList() {
  if (window.appState.mode === MODES.CHORES) {
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
  if (appState.mode === MODES.CHORES) {
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
