function renderShoppingPriorityOptions(selectedCallback) {
  return Object.values(window.priorities)
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
        shoppingItem.Priority === window.priorities.HAVE ? 'checked' : ''
      }/>
    </div>
  `;
}

export function updateShoppingItems() {
  window.appState.shoppingList.forEach((shoppingItem, index) => {
    const element = document.getElementById(`shoppingItem${index}`);

    element.style.display =
      window.appState.filters.shoppingListPriority === shoppingItem.Priority
        ? null
        : 'none';
  });
}

export function addShoppingItemListeners() {
  window.appState.shoppingList.forEach((shoppingItem, index) => {
    const element = document.getElementById(`shoppingItem${index}`);

    const checkboxElement = element.querySelector('.checkbox');
    checkboxElement.addEventListener('change', () => {
      if (checkboxElement.checked) {
        window.updateShoppingListItemPriority(index, window.priorities.HAVE);
      } else {
        window.updateShoppingListItemPriority(index, window.priorities.NEED);
      }
    });

    const selectElement = element.querySelector('.prioritySelect');
    selectElement.addEventListener('change', () => {
      window.updateShoppingListItemPriority(index, selectElement.value);
    });
  });
}
