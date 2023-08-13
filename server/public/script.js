// Get a reference to the "Checkout" button element
const button = document.getElementById(".checkout");

$(document).ready(function() {
  let cart = [];

  $(".add-to-cart").click(function() {
    const itemId = $(this).data("item");
    const itemName = $(this).data("item");
    const itemPrice = parseFloat($(this).data("price"));
    const existingCartItem = cart.find(item => item.name === itemName);
  
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }
  
    updateCart();
  });

  function updateCart() {
    $(".cart-list").empty();
    let total = 0;
    cart.forEach((item, index) => {
      $(".cart-list").append(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            ${item.name} - ${item.price.toFixed(2)} €
            <span class="ml-2">x ${item.quantity}</span>
          </div>
          <button class="btn btn-danger btn-sm delete-item" data-index="${index}">Delete</button>
        </li>
      `);
      total += item.price * item.quantity;
    });
    $(".cart-total").text(`${total.toFixed(2)} €`);
  
    $(".delete-item").click(function() {
      const index = $(this).data("index");
      cart.splice(index, 1);
      updateCart();
    });
  }
  
  
  
  

  $(".checkout").click( async function() {
    alert("Thank you for your purchase!");
    try {
      // Make a POST request to create a checkout session
      const response = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            { id: 1, quantity: 3 },
            { id: 2, quantity: 1 },
          ],
        }),
      });
  
      // Check if the response is okay (status code 200)
      if (response.ok) {
        // Parse the response JSON
        const { url } = await response.json();
        // Redirect the user to the checkout URL
        window.location = url;
      } else {
        // If response is not okay, parse JSON and reject with error
        const errorJson = await response.json();
        throw errorJson;
      }
    } catch (error) {
      // Catch any errors that occur and log the error
      console.error(error.error);
    }
    cart = [];
    updateCart();
  });

  
});

