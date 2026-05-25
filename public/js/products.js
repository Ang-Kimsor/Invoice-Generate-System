// Product management JavaScript
let allProducts = [];

// Initialize page
document.addEventListener("DOMContentLoaded", function () {
  loadProducts();

  // Form submission
  document
    .getElementById("productForm")
    .addEventListener("submit", handleAddProduct);
  document
    .getElementById("editForm")
    .addEventListener("submit", handleEditProduct);
});

// Load all products
async function loadProducts() {
  try {
    const response = await window.auth.fetch("/api/products");
    const result = await response.json();

    if (result.success) {
      allProducts = result.data;
      displayProducts();
    } else {
      showMessage("Failed to load products", "error");
    }
  } catch (error) {
    showMessage("Error loading products: " + error.message, "error");
  }
}

// Display products in grid
function displayProducts() {
  const productsList = document.getElementById("productsList");

  if (allProducts.length === 0) {
    productsList.innerHTML = `
    <div class="no-products">
    No products yet. Add a new product to get started.
    </div>`;
    return;
  }
  productsList.style.display = "grid";

  productsList.innerHTML = allProducts
    .map(
      (product) => `
    <div class="product-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
        <h3 style="margin: 0; font-size: 1.125rem;">${product.sku}</h3>
      </div>
      <div class="product-info">
        <strong style="display: block; color: var(--text-main); margin-bottom: 0.25rem;">${product.product_name}</strong>
        ${product.description ? `<p style="margin: 0;">${product.description}</p>` : ""}
      </div>
      <div class="product-prices">
        <div class="price-row">
          <span><i class="fa-solid fa-sack-dollar"></i> Bag Price</span>

          <span>$${parseFloat(product.bag_price || 0).toFixed(3)}</span>
        </div>
        ${parseFloat(product.streamer_price || 0) !== 0
          ? `
          <div class="price-row">
            <span><i class="fa-solid fa-ribbon"></i> Streamer</span>

            <span>$${parseFloat(product.streamer_price || 0).toFixed(3)}</span>
          </div>
        `
          : ""
        }
        <div class="price-row">
          <span><i class="fa-solid fa-box"></i> ${product.middle_unit}</span>

          <span>$${parseFloat(product.box_price || 0).toFixed(3)}</span>
        </div>
        <div class="price-row">
          <span><i class="fa-solid fa-truck-fast"></i> CTN Price</span>

          <span>$${parseFloat(product.ctn_price || 0).toFixed(3)}</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn" style="flex: 1; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 0.8125rem;" onclick="openEditModal(${product.id})">Edit</button>
        <button class="btn btn-danger" style="flex: 1; font-size: 0.8125rem;" onclick="deleteProduct(${product.id})">Delete</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Handle add product form submission
async function handleAddProduct(e) {
  e.preventDefault();
  const productData = {
    sku: document.getElementById("sku").value.trim(),
    productName: document.getElementById("productName").value.trim(),
    description: document.getElementById("description").value.trim(),
    bagPrice: parseFloat(document.getElementById("bagPrice").value) || 0,
    streamerPrice:
      parseFloat(document.getElementById("streamerPrice").value) || 0,
    boxPrice: parseFloat(document.getElementById("boxPrice").value) || 0,
    ctnPrice: parseFloat(document.getElementById("ctnPrice").value) || 0,
    middleUnit: document.getElementById("middleUnit").value,
  };

  // Validation
  if (!productData.sku || !productData.productName) {
    showMessage("SKU and Product Name are required", "error");
    return;
  }
  if (
    productData.bagPrice < 0 ||
    productData.streamerPrice < 0 ||
    productData.boxPrice < 0 ||
    productData.ctnPrice < 0
  ) {
    showMessage("Prices cannot be negative", "error");
    return;
  }

  try {
    const response = await window.auth.fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Product added successfully!", "success");
      document.getElementById("productForm").reset();
      loadProducts();
    } else {
      showMessage(result.message || "Failed to add product", "error");
    }
  } catch (error) {
    showMessage("Error adding product: " + error.message, "error");
  }
}

// Open edit modal
function openEditModal(productId) {
  const product = allProducts.find((p) => String(p.id) === String(productId));
  document.getElementById("editStreamerPrice").value = 0;
  document.getElementById("editStreamerPrice").parentElement.style.display = 'block';
  if (!product) {
    showMessage("Product not found", "error");
    return;
  }

  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.product_name;
  document.getElementById("editDescription").value = product.description || "";

  // ✅ MATCH EDIT FORM
  document.getElementById("editBagPrice").value = product.bag_price || 0;
  if (product.streamer_price == 0) {
    document.getElementById("editStreamerPrice").parentElement.style.display = 'none';
  } else {
    document.getElementById("editStreamerPrice").value = product.streamer_price || 0;
  }
  document.getElementById("editBoxLabel").textContent =
    `${product.middle_unit.charAt(0) + product.middle_unit.slice(1).toLowerCase()} Price ($)`;
  document.getElementById("editBoxPrice").value = product.box_price || 0;
  document.getElementById("editCtnPrice").value = product.ctn_price || 0;
  document.getElementById("editModal").classList.add("active");
}

// Close edit modal
function closeEditModal() {
  document.getElementById("editModal").classList.remove("active");
}

// Handle edit product form submission
async function handleEditProduct(e) {
  e.preventDefault();

  const productId = document.getElementById("editProductId").value;

  const productData = {
    productName: document.getElementById("editProductName").value.trim(),
    description: document.getElementById("editDescription").value.trim(),

    // ✅ MATCH EDIT INPUTS
    bagPrice: parseFloat(document.getElementById("editBagPrice").value) || 0,
    streamerPrice:
      parseFloat(document.getElementById("editStreamerPrice").value) || 0,
    boxPrice: parseFloat(document.getElementById("editBoxPrice").value) || 0,
    ctnPrice: parseFloat(document.getElementById("editCtnPrice").value) || 0,
  };

  if (!productData.productName) {
    showMessage("Product Name is required", "error");
    return;
  }

  if (
    productData.bagPrice < 0 ||
    productData.streamerPrice < 0 ||
    productData.boxPrice < 0 ||
    productData.ctnPrice < 0
  ) {
    showMessage("Prices cannot be negative", "error");
    return;
  }

  try {
    const response = await window.auth.fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Product updated successfully!", "success");
      closeEditModal();
      loadProducts();
    } else {
      showMessage(result.message || "Failed to update product", "error");
    }
  } catch (error) {
    showMessage("Error updating product: " + error.message, "error");
  }
}

// Delete product
async function deleteProduct(productId) {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    const response = await window.auth.fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Product deleted successfully!", "success");
      loadProducts();
    } else {
      showMessage(result.message || "Failed to delete product", "error");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    showMessage("Error deleting product: " + error.message, "error");
  }
}

// Show unified message
function showMessage(message, type) {
  const container = document.getElementById("messageContainer");
  if (!container) return;
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  const icon = type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
  messageDiv.innerHTML = `<span>${icon}</span> <span>${message}</span>`;


  container.innerHTML = "";
  container.appendChild(messageDiv);

  if (type === "success") {
    setTimeout(() => {
      if (messageDiv.parentNode) messageDiv.remove();
    }, 5000);
  }
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  const modal = document.getElementById("editModal");
  if (event.target === modal) {
    closeEditModal();
  }
});
