$(document).ready(function() {
  let cart = [];
  let items = [];

  fetch("http://localhost:3000/items")
    .then(response => response.json())
    .then(data => {
      items = data.map(([id, item]) => ({ id, ...item })); // Map fetched data to correct structure
      console.log(items);
      populateProductsList();
    })
    .catch(error => {
      console.error("Error fetching items:", error);
    });

  $(document).on("click", ".add-to-cart", function() {
    const itemId = parseInt($(this).data("item-id"));
    const existingCartItemIndex = cart.findIndex(item => item.id === itemId);

    if (existingCartItemIndex !== -1) {
      cart[existingCartItemIndex].quantity += 1;
    } else {
      const selectedItem = items.find(item => item.id === itemId);
      const newItem = { ...selectedItem, quantity: 1 };
      cart.push(newItem);
    }

    updateCart();
  });

  function updateCart() {
    console.log(cart);
    $(".cart-list").empty();
    let total = 0;

    cart.forEach(item => {
      const product = items.find(prod => prod.id === item.id);
      const itemTotalPrice = (product.priceInCents / 100).toFixed(2);

      $(".cart-list").append(`
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            ${product.name} - ${itemTotalPrice} €
            <span class="ml-2">x ${item.quantity}</span>
          </div>
          <button class="btn btn-danger btn-sm delete-item" data-id="${item.id}">Delete</button>
        </li>
      `);
      total += product.priceInCents * item.quantity;
    });

    $(".cart-total").text(`${(total / 100).toFixed(2)} €`);

    $(".delete-item").click(function() {
      const itemId = parseInt($(this).data("id"));
      const itemIndex = cart.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        updateCart();
      }
    });
  }

  $(".checkout").click(async function() {
    alert("Thank you for your purchase!");
    fetch("http://localhost:3000/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: cart,
    }),
  })
    .then(res => {
      if (res.ok) return res.json()
      return res.json().then(json => Promise.reject(json))
    })
    .then(({ url }) => {
      window.location = url
    })
    .catch(e => {
      console.error(e.error)
    })
    cart = [];
    updateCart();
  });

  function populateProductsList() {
    const productsList = $("#products-list");
    items.forEach(item => {
      const colDiv = $("<div>").addClass("col-md-4 mb-3");
      const cardDiv = $("<div>").addClass("card");
      const img = $("<img>").attr("src", "imgs/shop.png").addClass("card-img-top").attr("alt", item.name);
      const cardBodyDiv = $("<div>").addClass("card-body");
      const title = $("<h5>").addClass("card-title").text(item.name);
      const price = $("<p>").addClass("card-text").text(`${(item.priceInCents / 100).toFixed(2)} €`);
      const addToCartBtn = $("<button>").addClass("btn btn-primary add-to-cart").attr("data-item-id", item.id).text("Add to Cart");

      cardBodyDiv.append(title, price, addToCartBtn);
      cardDiv.append(img, cardBodyDiv);
      colDiv.append(cardDiv);
      productsList.append(colDiv);
    });
  }
});
