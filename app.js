export function render() {
  const appState = window.appState;

  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const message = document.getElementById('message');

  if (!appState.gapiInited || !appState.gisInited) {
    authorizeButton.style.visibility = 'hidden';
    signoutButton.style.visibility = 'hidden';
    message.innerHTML = 'Loading page...';
    return;
  }

  authorizeButton.style.visibility = 'visible';

  if (!appState.isLoggedIn) {
    authorizeButton.innerText = 'Sign in';
    signoutButton.style.visibility = 'visible';
    message.innerHTML = 'Currently signed out.';
  } else {
    authorizeButton.innerText = 'Refresh';
    signoutButton.style.visibility = 'visible';
    if (appState.loadingError) {
      message.innerHTML = loadingError.message;
    } else if (appState.allChores === null) {
      message.innerHTML = 'Loading chores...';
    } else if (appState.allChores.length === 0) {
      message.innerHTML = 'No data found!';
    } else {
      message.innerHTML = JSON.stringify(appState.allChores, null, 2);
    }
  }
}
