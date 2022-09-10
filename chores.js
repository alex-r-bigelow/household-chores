import { ALL_CHORE_CATEGORIES, CHORE_CATEGORIES } from './constants.js';

const TODAY = new Date();

const previousCompleteDates = {};

export function renderChoreFilters() {
  return `
    <select data-filter="choreCategory" onchange="handleFilterChange()">
        ${CHORE_CATEGORIES.map(
          (category) =>
            `<option ${
              window.appState.filters.choreCategory === category
                ? 'selected'
                : ''
            }>${category}</option>`
        ).join('')}
    </select>
  `;
}

export function setupChore(chore, index) {
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
    ${
      index === window.appState.allChores.length - 1
        ? ''
        : `<hr class="divider" id="divider${index}"/>`
    }
  `;
}

function getChoreState(chore, index) {
  const dueDate = new Date(chore.Due);
  const completeDate = new Date(chore.Completed);
  const choreDueToday = !isNaN(dueDate) && dueDate <= TODAY;
  const choreCompleteToday =
    previousCompleteDates[`chore${index}`] !== undefined ||
    (!isNaN(completeDate) &&
      completeDate.toLocaleDateString() === TODAY.toLocaleDateString());
  const choreDue = choreDueToday && !choreCompleteToday;

  return { choreCompleteToday, choreDue };
}

function isChoreVisible(chore) {
  const passesCategoryFilter =
    window.appState.filters.choreCategory === ALL_CHORE_CATEGORIES ||
    window.appState.filters.choreCategory === chore.Category;
  return passesCategoryFilter;
}

function getNextVisibleChoreState(index) {
  while (index < window.appState.allChores.length) {
    const chore = window.appState.allChores[index];
    if (isChoreVisible(chore)) {
      return getChoreState(chore, index);
    }
    index += 1;
  }
  return null;
}

export function updateChores() {
  window.appState.allChores.forEach((chore, index) => {
    const { choreCompleteToday, choreDue } = getChoreState(chore, index);

    const choreElement = document.getElementById(`chore${index}`);
    choreElement.classList.toggle('due', choreDue);
    choreElement.classList.toggle('complete', choreCompleteToday);

    const checkboxElement = choreElement.querySelector('.checkbox');
    checkboxElement.checked = choreCompleteToday;

    choreElement.style.display = isChoreVisible(chore) ? null : 'none';

    const dividerElement = document.getElementById(`divider${index}`);
    if (dividerElement !== null) {
      const nextChoreState = getNextVisibleChoreState(index + 1);
      dividerElement.classList.toggle(
        'due',
        choreDue || nextChoreState?.choreDue
      );
      dividerElement.classList.toggle(
        'complete',
        choreCompleteToday || nextChoreState?.choreCompleteToday
      );
      dividerElement.style.display = isChoreVisible(chore) ? null : 'none';
    }
  });
}

export function addChoreCheckboxListeners() {
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
