const TODAY = new Date();

const previousCompleteDates = {};

function setupChore(chore, index) {
  return `
    <div class="chore" id="chore${index}">
      <details>
        <summary class="task">${chore.Task}</summary>
        <div class="stats">
          <div>
            <span>Category:</span>
            <span>${chore.Category || 'None'}</span>
          </div>
          <div>
            <span>Last completed:</span>
            <span>${chore.Completed || 'Never'}</span>
          </div>
          <div>
            <span>Frequency:</span>
            <span>${
              chore.Frequency && chore.Unit
                ? `Every ${chore.Frequency || ''} ${chore.Unit}`
                : ''
            }</span>
          </div>
        </div>
        <div class="description">${chore.Description || ''}</div>
        <div class="notes">${chore.Notes || ''}</div>
      </details>
      <input type="checkbox" class="checkbox"/>
    </div>
  `;
}

export function updateChores() {
  appState.allChores.forEach((chore, index) => {
    const dueDate = new Date(chore.Due);
    const completeDate = new Date(chore.Completed);
    const choreDueToday = !isNaN(dueDate) && dueDate <= TODAY;
    const choreCompleteToday =
      previousCompleteDates[`chore${index}`] !== undefined ||
      (!isNaN(completeDate) &&
        completeDate.toLocaleDateString() === TODAY.toLocaleDateString());
    const choreDue = choreDueToday && !choreCompleteToday;

    const choreElement = document.getElementById(`chore${index}`);
    choreElement.classList.toggle('due', choreDue);
    choreElement.classList.toggle('complete', choreCompleteToday);

    const checkboxElement = choreElement.querySelector('.checkbox');
    checkboxElement.checked = choreCompleteToday;
  });
}

function addCheckboxListeners() {
  appState.allChores.forEach((chore, index) => {
    const checkboxElement = document
      .getElementById(`chore${index}`)
      .querySelector('.checkbox');
    checkboxElement.addEventListener('change', () => {
      if (checkboxElement.checked) {
        // Just checked something
        previousCompleteDates[`chore${index}`] = chore.Completed || '';
        window.updateChoreCompletedDate(index, TODAY.toLocaleDateString());
      } else {
        const previousCompleteDate =
          previousCompleteDates[`chore${index}`] || '';
        delete previousCompleteDates[`chore${index}`];
        window.updateChoreCompletedDate(index, previousCompleteDate);
      }
      updateChores();
    });
  });
}

export function render() {
  const appState = window.appState;

  const authorizeButton = document.getElementById('authorize_button');
  const signoutButton = document.getElementById('signout_button');
  const message = document.getElementById('message');
  const pageContent = document.getElementById('page_content');

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
      message.innerHTML = 'Chores loaded';
      pageContent.innerHTML = appState.allChores.map(setupChore).join('');
      addCheckboxListeners();
      updateChores();
    }
  }
}
