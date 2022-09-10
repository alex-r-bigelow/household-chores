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
          <select>
            ${Object.values(window.priorities)
              .map(
                (priorityString) =>
                  `<option ${
                    shoppingItem.Priority === priorityString ? 'selected' : ''
                  }>${priorityString}</option>`
              )
              .join('')}
          </select>
        </div>
      </details>
      <input type="checkbox" class="checkbox"/>
    </div>
  `;
}

export function updateShoppingItems() {
  appState.shoppingList.forEach((shoppingItem, index) => {
    // TODO
  });
}

export function addShoppingItemListeners() {
  appState.shoppingList.forEach((shoppingItem, index) => {
    const checkboxElement = document
      .getElementById(`shoppingItem${index}`)
      .querySelector('.checkbox');
    checkboxElement.addEventListener('change', () => {
      // TODO
    });
  });
}
