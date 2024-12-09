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

    payButton.addEventListener("click", (e) => {
        e.preventDefault();

        // Validate form inputs
        const fullName = document.getElementById("full-name").value.trim();
        const age = parseInt(document.getElementById("age").value, 10);
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const deliveryMethod = document.querySelector("input[name='delivery-method']:checked")?.value;
        const paymentMethod = document.querySelector("input[name='payment-method']:checked")?.value;

        if (!fullName || !email || !phone || isNaN(age) || age < 18) {
            alert("Please fill all required fields and ensure age is 18 or above.");
            return;
        }

        if (!deliveryMethod) {
            alert("Please select a delivery method.");
            return;
        }

        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        if (paymentMethod === "card") {
            const cardNumber = document.getElementById("card-number").value.trim();
            const expiryDate = document.getElementById("expiry-date").value.trim();
            const cvv = document.getElementById("cvv").value.trim();

            if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
                alert("Card number must be a 16-digit number.");
                return;
            }

            const [year, month] = expiryDate.split("-");
            const expiry = new Date(year, month - 1);
            if (expiry <= new Date()) {
                alert("Expiry date must be in the future.");
                return;
            }

            if (cvv.length !== 3 || !/^\d+$/.test(cvv)) {
                alert("CVV must be a 3-digit number.");
                return;
            }
        }

        // Calculate delivery date (within 24 hours)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        const formattedDate = deliveryDate.toLocaleDateString();

        // Create receipt HTML
        const receiptHTML = `
            <div class="payment-confirmation">
                <h2>Payment Confirmation</h2>
                <h3>Personal Details</h3>
                <table>
                    <tr><th>Name</th><td>${fullName}</td></tr>
                    <tr><th>Email</th><td>${email}</td></tr>
                    <tr><th>Phone</th><td>${phone}</td></tr>
                </table>
                <h3>Payment Method</h3>
                <table>
                    <tr><th>Method</th><td>${paymentMethod}</td></tr>
                    ${paymentMethod === 'card' ? `
                        <tr><th>Card Number</th><td>${document.getElementById("card-number").value}</td></tr>
                        <tr><th>Expiry Date</th><td>${document.getElementById("expiry-date").value}</td></tr>
                    ` : ''}
                </table>
                <h3>Delivery Method</h3>
                <table>
                    <tr><th>Method</th><td>${deliveryMethod}</td></tr>
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