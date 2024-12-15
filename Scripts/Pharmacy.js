const medicineContainer = document.getElementById('medicine-categories');
const cart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMedicines();
})

document.getElementById('save-favorites').addEventListener('click', saveFavorites);
document.getElementById('apply-favorites').addEventListener('click', applyFavorites);  
document.getElementById('buy-now').addEventListener('click', proceedToCheckout);

function loadMedicines() {
    fetch('./JSON/Medicines.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load medicines');
        }
        return response.json();
    })
    .then(data => renderMedicines(data))
    .catch(error => {
        console.error('Error loading medicines: ', error);
        alert('Failed to load medicines. Please try again later.');
    });
}

function renderMedicines(data) {
    data.forEach(category => {
        // Create a heading for the category
        const categoryHeading = document.createElement('h3');
        categoryHeading.classList.add('category-heading');
        categoryHeading.textContent = category.category;

        // Create a container for the medicines
        const medicineListDiv = document.createElement('div');
        medicineListDiv.classList.add('medicine-list');

        // Add each medicine as a card
        category.items.forEach(item => {
            const medicineItemDiv = document.createElement('div');
            medicineItemDiv.classList.add('medicine-item');

            const medicineQuantityId = `${item.name}-qty`;

            medicineItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="medicine-image">
                <h4 class="medicine-name">${item.name}</h4>
                <p class="medicine-price">LKR ${item.price}</p>
                <label for="${medicineQuantityId}" class="sr-only">Quantity</label>
                <input type="number" min="1" value="1" id="${medicineQuantityId}" class="medicine-quantity" pattern="\d*">
                <button class="add-to-cart-btn">Add to Cart</button>
            `;
            // Add event listener for the 'input' event to validate quantity input
            const qtyInput = medicineItemDiv.querySelector(`#${medicineQuantityId}`);
            qtyInput.addEventListener('input', function() {
                if (!/^\d+$/.test(qtyInput.value)) {
                    alert('Please enter a valid number for quantity.');
                    qtyInput.value = '';  // Clear invalid input
                }
            });

            // Add event listener for the 'Add to Cart' button
            const addToCartButton = medicineItemDiv.querySelector('.add-to-cart-btn');
            addToCartButton.addEventListener('click', () => {
                addToCart(item.name, item.price, medicineQuantityId);
            });

            medicineListDiv.appendChild(medicineItemDiv);
        });

        // Append the category heading and medicine list to the main container
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category');
        categoryContainer.appendChild(categoryHeading);
        categoryContainer.appendChild(medicineListDiv);

        // Append the category to the medicine container
        medicineContainer.appendChild(categoryContainer);
    });
}


function addToCart(name, price, qtyInputId) {
    try {
        const qty = parseInt(document.getElementById(qtyInputId).value);
        if (qty <= 0) {
            alert("Quantity must be at least 1");
            return;
        }

        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty += qty;
        }
        else {
            cart.push({ name, price, qty });
        }
        renderCart();
    }
    catch (error) {
        console.error('Error adding to cart: ', error);
        alert('An error occurred while adding the item to the cart. Please try again.');
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const total = item.price * item.qty;
        grandTotal += total;

        cartItemsContainer.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.qty}</td>
                <td>${total.toFixed(2)}</td>
                <td><button class="remove-item" data-index="${index}">Remove</button></td>
            </tr>
        `;
    });

    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);

    document.querySelectorAll('.remove-item').forEach(button =>
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'), 10);
            removeFromCart(index);
        })
    );
}

function removeFromCart(index) {
    try {
        cart.splice(index, 1);
        renderCart();
    }
    catch (error) {
        console.error('Error removing item from cart: ', error);
        alert('An error occurred while removing the item from the cart. Please try again.');
    }
}

function saveFavorites() {
    try {
        if (cart.length === 0) {
            alert('Nothing was added to the cart');
            return;
        }
        localStorage.setItem('favorites', JSON.stringify(cart));
        alert('Favorites Saved!!');
    }
    catch (error) {
        console.error('Error saving favorites: ', error);
        alert('An error has occurred when saving your favorites. Please try again...');
    }
}

function applyFavorites() {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites'));
        if (!favorites || favorites.length === 0) {
            alert('No Favorites Saved!!');
        } else {
            favorites.forEach(item => {
                const existingItem = cart.find(cartItem => cartItem.name === item.name);
                if (existingItem) {
                    existingItem.qty += item.qty;
                } else {
                    cart.push(item);
                }
            });
            renderCart();
        }
    } catch (error) {
        console.error('Error applying favorites:', error);
        alert('An error has occurred while applying your favorites. Please try again...');
    }
}


function proceedToCheckout() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart saved:', JSON.stringify(cart));
        window.location.href = 'Checkout.html';
    }
    catch (error) {
        console.error('Error during checkout: ', error);
        alert('An error occurred while proceeding to checkout. Please try again.');
    }
}
