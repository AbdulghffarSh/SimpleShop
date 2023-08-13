$(document).ready(function() {
  let cart = [];

  $(document).on("click", ".add-to-cart", function() {
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

  $(".checkout").click(async function() {
    alert("Thank you for your purchase!");
    try {
      
      const response = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location = url;
      } else {
        const errorJson = await response.json();
        throw errorJson;
      }
    } catch (error) {
      console.error(error);
    }
    cart = [];
    updateCart();
  });

  // Fetch and populate the product listing
  fetch("http://localhost:3000/items")
    .then(response => response.json())
    .then(items => {
      const productsList = $("#products-list"); // Use jQuery selector
      items.forEach(item => {
        const colDiv = $("<div>").addClass("col-md-4 mb-3");
        const cardDiv = $("<div>").addClass("card");
        const img = $("<img>").attr("src", "imgs/shop.png").addClass("card-img-top").attr("alt", item.name);
        const cardBodyDiv = $("<div>").addClass("card-body");
        const title = $("<h5>").addClass("card-title").text(item.name);
        const price = $("<p>").addClass("card-text").text(`${item.price.toFixed(2)} €`);
        const addToCartBtn = $("<button>").addClass("btn btn-primary add-to-cart").attr("data-item", item.name).attr("data-price", item.price).text("Add to Cart");

        cardBodyDiv.append(title, price, addToCartBtn);
        cardDiv.append(img, cardBodyDiv);
        colDiv.append(cardDiv);
        productsList.append(colDiv);
      });
    })
    .catch(error => {
      console.error("Error fetching items:", error);
    });
});
