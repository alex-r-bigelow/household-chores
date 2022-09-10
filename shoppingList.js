const TODAY = new Date();

const previousCompleteDates = {};

export function setupShoppingItem(shoppingItem, index) {
  return `
    <div class="shoppingItem" id="shoppingItem${index}">
      <details>
        <summary class="task">${shoppingItem.Item}</summary>
        <div class="stats">
          <div>
            <span>Store:</span>
            <span>${shoppingItem.Store || 'None'}</span>
          </div>
          <div>
            <span>Priority:</span>
            <span>${shoppingItem.Priority || 'Never'}</span>
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

export function addShoppingItemCheckboxListeners() {
  appState.shoppingList.forEach((shoppingItem, index) => {
    const checkboxElement = document
      .getElementById(`shoppingItem${index}`)
      .querySelector('.checkbox');
    checkboxElement.addEventListener('change', () => {
      // TODO
    });
  });
}
