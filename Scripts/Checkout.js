document.addEventListener("DOMContentLoaded", () => {
    const orderForm = document.getElementById("order-form");
    const deliveryAddressSection = document.getElementById("delivery-address");
    const cardDetailsSection = document.getElementById("card-details");
    const summaryTableBody = document.getElementById("summary-table-body");
    const grandTotalElement = document.getElementById("grand-total");
    const payButton = document.getElementById("pay-button");

    // Hide delivery and card details initially
    deliveryAddressSection.style.display = "none";
    cardDetailsSection.style.display = "none";

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    summaryTableBody.innerHTML = ''; // Clear the table first
    let grandTotal = 0;

    cart.forEach(item => {
        const row = document.createElement("tr");

        // Calculate total for the item
        const total = item.price * item.qty;
        grandTotal += total;

        // Add table cells
        row.innerHTML = `
            <td>${item.name}</td>
            <td>LKR ${item.price.toFixed(2)}</td>
            <td>${item.qty}</td>
            <td>LKR ${total.toFixed(2)}</td>
        `;

        // Append the row to the table body
        summaryTableBody.appendChild(row);
    });

    // Update the grand total in the DOM
    grandTotalElement.textContent = `LKR ${grandTotal.toFixed(2)}`;

    // Show/hide delivery and card details based on selected options
    document.querySelectorAll("input[name='delivery-method']").forEach(radio => {
        radio.addEventListener("change", () => {
            deliveryAddressSection.style.display = radio.value === "delivery" ? "block" : "none";
        });
    });

    document.querySelectorAll("input[name='payment-method']").forEach(radio => {
        radio.addEventListener("change", () => {
            cardDetailsSection.style.display = radio.value === "card" ? "block" : "none";
        });
    });

    // Real-time validation for card number and CVV length
    document.getElementById("card-number").addEventListener("input", function() {
        if (this.value.length > 16) {
            alert("Card Number must be exactly 16 digits.");
            this.value = this.value.slice(0, 16);
        }
    });

    document.getElementById("cvv").addEventListener("input", function() {
        if (this.value.length > 3) {
            alert("CVV must be exactly 3 digits.");
            this.value = this.value.slice(0, 3);
        }
    });

    const ageInput = document.getElementById("age");
    ageInput.addEventListener("blur", function() {
        const age = parseInt(this.value, 10);
        if (isNaN(age) || age < 18) {
            alert("You must be 18 or older to place an order.");
            this.value = ''; // Clear the age input if it's invalid
        }
    });

    orderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const age = parseInt(document.getElementById("age").value, 10);
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const deliveryMethod = document.querySelector("input[name='delivery-method']:checked")?.value;
        const paymentMethod = document.querySelector("input[name='payment-method']:checked")?.value;

        // Check minimum age
        if (age < 18 || isNaN(age)) {
            alert("You must be 18 or older to place an order.");
            return;
        }

        // Validate form completion
        if (!fullName || !email || !phone || !deliveryMethod || !paymentMethod) {
            alert("Please fill all required fields.");
            return;
        }

        // Validate card details if payment method is card
        if (paymentMethod === "card") {
            const cardNumber = document.getElementById("card-number").value.trim();
            const cvv = document.getElementById("cvv").value.trim();

            // Check card number length
            if (cardNumber.length !== 16) {
                alert("Card Number must be exactly 16 digits.");
                return;
            }

            // Check CVV length
            if (cvv.length !== 3) {
                alert("CVV must be exactly 3 digits.");
                return;
            }

            // Validate input for card number and CVV
            const cardNumberPattern = /^\d{1,16}$/; 
            const cvvPattern = /^\d{1,3}$/; 

            if (!cardNumberPattern.test(cardNumber)) {
                alert("Card Number must contain only digits.");
                return;
            }

            if (!cvvPattern.test(cvv)) {
                alert("CVV must contain only digits.");
                return;
            }

            // Validate expiry date
            const expiryDate = document.getElementById("expiry-date").value.trim();
            const [year, month] = expiryDate.split("-");
            const expiry = new Date(year, month - 1);
            if (expiry <= new Date()) {
                alert("Expiry date must be in the future.");
                return;
            }
        }

        // Calculate delivery date (within 24 hours)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 1);

        // Format as dd.mm.yyyy
        const day = String(deliveryDate.getDate()).padStart(2, '0');
        const month = String(deliveryDate.getMonth() + 1).padStart(2, '0'); 
        const year = deliveryDate.getFullYear();
        const formattedDate = `${day}.${month}.${year}`;

        const receiptHTML = `
        <div class="payment-confirmation">
            <h2>Payment Confirmation</h2>
            <h3>Personal Details</h3>
            <table>
            <tr><th>Name</th><td>${fullName}</td></tr>
            <tr><th>Age</th><td>${age}</td></tr>
            <tr><th>Email</th><td>${email}</td></tr>
            <tr><th>Phone</th><td>${phone}</td></tr>
            </table>
            <h3>Payment Method</h3>
            <table>
            <tr><th>Method</th><td>${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}</td></tr>
            ${paymentMethod === 'card' ? `
                <tr><th>Card Number</th><td>${document.getElementById("card-number").value}</td></tr>
                <tr><th>Expiry Date</th><td>${document.getElementById("expiry-date").value}</td></tr>
            ` : ''}
            </table>
            <h3>Delivery Method</h3>
            <table>
            <tr><th>Method</th><td>${deliveryMethod.charAt(0).toUpperCase() + deliveryMethod.slice(1)}</td></tr>
            ${deliveryMethod === 'delivery' ? `<tr><th>Address</th><td>${document.getElementById("address").value}</td></tr>` : ''}
            </table>
            <h3>Order Summary</h3>
            <table class="summary-table">
            <thead>
                <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>LKR ${item.price.toFixed(2)}</td>
                    <td>LKR ${(item.price * item.qty).toFixed(2)}</td>
                </tr>
                `).join('')}
                <tr>
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>LKR ${grandTotal.toFixed(2)}</strong></td>
                </tr>
            </tbody>
            </table>
            <p class="message">Thank you for purchasing from Carewell's Online Pharmacy. Your order will be delivered on ${formattedDate}!</p>
            <button id="back-to-pharmacy-button">Return to Pharmacy</button>
        </div>
        `;

        // Display receipt and redirect to pharmacy page
        document.body.innerHTML = receiptHTML;
        document.getElementById("back-to-pharmacy-button").addEventListener("click", () => {
            window.location.href = "pharmacy.html";
        });
    });
});