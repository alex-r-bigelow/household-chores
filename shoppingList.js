import { ALL_PRIORITIES, ALL_STORES, STORES, PRIORITIES } from './constants.js';

function renderShoppingPriorityOptions(selectedCallback) {
  return Object.values(PRIORITIES)
    .map(
      (priorityString) =>
        `<option ${
          selectedCallback(priorityString) ? 'selected' : ''
        }>${priorityString}</option>`
    )
    .join('');
}

export function renderShoppingListFilters() {
  return `
      <select data-filter="shoppingListPriority" onchange="handleFilterChange()">
        ${renderShoppingPriorityOptions(
          (priorityString) =>
            window.appState.filters.shoppingListPriority === priorityString
        )}
        <option ${
          window.appState.filters.shoppingListPriority === ALL_PRIORITIES
            ? 'selected'
            : ''
        }>Show All</option>
      </select>
      <select data-filter="shoppingListStore" onchange="handleFilterChange()">
          ${STORES.map(
            (store) =>
              `<option ${
                window.appState.filters.shoppingListStore === store
                  ? 'selected'
                  : ''
              }>${store}</option>`
          ).join('')}
      </select>
  `;
}

export function setupShoppingItem(shoppingItem, index) {
  return `
    <div class="shoppingItem" id="shoppingItem${index}">
      <details>
        <summary class="task">${shoppingItem.Item}</summary>
        <div class="stats">
          <div>
            <span>Store:</span>
            <span>${shoppingItem.Store || 'N/A'}</span>
          </div>
          ${
            shoppingItem.Qty
              ? `
          <div>
            <span>Qty:</span>
            <span>${shoppingItem.Qty}</span>
          </div>`
              : ''
          }
          <select class="prioritySelect">
            ${renderShoppingPriorityOptions(
              (priorityString) => shoppingItem.Priority === priorityString
            )}
          </select>
        </div>
      </details>
      <input type="checkbox" class="checkbox" ${
        shoppingItem.Priority === PRIORITIES.HAVE ? 'checked' : ''
      }/>
    </div>
  `;
}

export function updateShoppingItems() {
  window.appState.shoppingList.forEach((shoppingItem, index) => {
    const element = document.getElementById(`shoppingItem${index}`);

    const passesPriorityFilter =
      window.appState.filters.shoppingListPriority === shoppingItem.Priority ||
      window.appState.filters.shoppingListPriority === ALL_PRIORITIES;
    const passesStoreFilter =
      window.appState.filters.shoppingListStore === ALL_STORES ||
      window.appState.filters.shoppingListStore === shoppingItem.Store;

    element.style.display =
      passesPriorityFilter && passesStoreFilter ? null : 'none';
  });
}

export function addShoppingItemListeners() {
  window.appState.shoppingList.forEach((shoppingItem, index) => {
    const element = document.getElementById(`shoppingItem${index}`);

    const checkboxElement = element.querySelector('.checkbox');
    checkboxElement.addEventListener('change', () => {
      if (checkboxElement.checked) {
        window.updateShoppingListItemPriority(index, PRIORITIES.HAVE);
      } else {
        window.updateShoppingListItemPriority(index, PRIORITIES.NEED);
      }
    });

    const selectElement = element.querySelector('.prioritySelect');
    selectElement.addEventListener('change', () => {
      window.updateShoppingListItemPriority(index, selectElement.value);
    });
  });
}
