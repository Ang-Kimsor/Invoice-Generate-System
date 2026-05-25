// Invoice form application logic
const app = {
  products: [],

  // Initialize the application
  async init() {
    // Load products first
    await this.loadProducts();

    // Generate initial invoice number
    this.generateInvoiceNumber();

    // Add first empty item row
    this.addItemRow();

    // Listen to form submission
    document.getElementById("invoiceForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      // 🛑 Prevent double click
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving...";
      try {
        const isSaved = await this.submitForm();
        if (isSaved) {
          this.resetItemRow();
          this.addItemRow();
          this.generateInvoiceNumber();
          this.updateTotal();
        }
      } finally {
        // ✅ Always re-enable (even if error)
        submitBtn.disabled = false;
        submitBtn.innerText = "Save Invoice";
      }
    });

    // Listen to reset button
    document.getElementById("invoiceForm").addEventListener("reset", () => {
      setTimeout(() => {
        this.resetItemRow();
        this.addItemRow();
        this.generateInvoiceNumber();
        this.updateTotal();
      }, 0);
    });
  },

  // Load products from server
  async loadProducts() {
    try {
      const response = await window.auth.fetch("/api/products");
      const result = await response.json().catch(() => null);

      if (response.ok && result?.success) {
        this.products = result.data;
      } else {
        console.error("Failed to load products:", result.message);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  },

  // Generate invoice number (will come from server in real scenario)
  generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    const timestamp = Date.now() % 1000; // Last 3 digits of timestamp
    const invoiceNo = `INV-${year}${month}${date}-${String(timestamp).padStart(3, "0")}`;
    document.getElementById("invoiceNumber").value = invoiceNo;
  },


  // Add a new item row to the form
  addItemRow() {
    const container = document.getElementById("itemsContainer");

    const itemRow = document.createElement("div");
    itemRow.className = "item-row"; // Removed item-card as it's now styled in style.css

    const productOptions = this.products
      .map(
        (p) =>
          `<option value="${p.id}" 
            data-name="${p.product_name}"
            data-sku="${p.sku}"
            data-bag="${p.bag_price}"
            data-streamer="${p.streamer_price}"
            data-box="${p.box_price}"
            data-ctn="${p.ctn_price}"
            data-middle="${p.middle_unit}">
            ${p.sku} - ${p.product_name}
          </option>`,
      ).join("");

    itemRow.innerHTML = `
      <!-- PRODUCT -->
      <div class="form-group" style="margin-bottom: 0;">
        <label>Product</label>
        <select class="item-product" onchange="app.onProductSelect(this)">
          <option value="">Select Product</option>
          ${productOptions}
        </select>
      </div>

      <!-- QTY -->
      <div class="form-group" style="margin-bottom: 0;">
        <label style="text-align: center;">Qty</label>
        <input type="number" class="item-quantity" value="1"
          style="text-align: center;"
          disabled
          onchange="app.updateTotal()"
          oninput="app.updateSubtotal(this.closest('.item-row'))">
      </div>

      <!-- UNIT -->
      <div class="form-group" style="margin-bottom: 0;">
        <label>Unit Type</label>
        <select class="item-unit-select" disabled onchange="app.onUnitChange(this)">
          <option value="">Unit</option>
        </select>

        <input type="hidden" class="item-unit-type">
        <input type="hidden" class="item-foc-unit">
      </div>

      <!-- PRICE -->
      <div class="form-group" style="margin-bottom: 0;">
        <label>Price</label>
        <input type="number" class="item-price" readonly placeholder="0.000">
      </div>

      <!-- SUBTOTAL -->
      <div class="form-group" style="margin-bottom: 0;">
        <label style="text-align: right;">Subtotal</label>
        <div class="item-subtotal" style="font-weight: 700; text-align: right; padding: 0.75rem 0;">$ 0.000</div>
      </div>

      <button type="button" class="btn-remove" onclick="app.removeItemRow(this)">
        <i class="fa-solid fa-trash-can"></i>
      </button>

    `;

    container.appendChild(itemRow);
  },
  onUnitChange(selectElement) {
    const itemRow = selectElement.closest(".item-row");
    const productSelect = itemRow.querySelector(".item-product");
    const option = productSelect.options[productSelect.selectedIndex];

    if (!option.value) {
      this.showMessage("Select product first", "error");
      return;
    }

    const prices = {
      BAG: parseFloat(option.dataset.bag) || 0,
      STREAMER: parseFloat(option.dataset.streamer) || 0,
      BOX: parseFloat(option.dataset.box),
      LINER: parseFloat(option.dataset.box) || 0, // reuse same price
      CTN: parseFloat(option.dataset.ctn) || 0,
    };

    let value = selectElement.value;
    let isFOC = value.startsWith("FOC_");

    let unit = isFOC ? value.replace("FOC_", "") : value;

    let price = isFOC ? 0 : prices[unit] || 0;

    itemRow.querySelector(".item-unit-type").value = isFOC ? "FOC" : unit;
    itemRow.querySelector(".item-foc-unit").value = unit;
    itemRow.querySelector(".item-price").value = price.toFixed(3);

    this.updateSubtotal(itemRow);
    this.updateTotal();
    this.updateAvailableUnits();
  },
  // Update unit availability based on current selections
  updateAvailableUnits() {
    const rows = document.querySelectorAll(".item-row");
    const selections = Array.from(rows).map((row) => ({
      productId: row.querySelector(".item-product").value,
      unitValue: row.querySelector(".item-unit-select").value,
      row: row,
    }));

    rows.forEach((currentRow) => {
      const productId = currentRow.querySelector(".item-product").value;
      const unitSelect = currentRow.querySelector(".item-unit-select");

      if (!productId) return;

      const options = unitSelect.querySelectorAll("option");
      options.forEach((opt) => {
        if (!opt.value) return;

        // Is this unit used by ANY row OTHER than this one for this same product?
        const isUsedInOtherRow = selections.some(
          (s) =>
            s.productId === productId &&
            s.unitValue === opt.value &&
            s.row !== currentRow,
        );

        if (isUsedInOtherRow) {
          opt.disabled = true;
          opt.style.display = "none";
        } else {
          opt.disabled = false;
          opt.style.display = "block";
        }
      });
    });
  },


  // add new to reset item rows
  resetItemRow() {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";
  },

  // Remove an item row
  removeItemRow(button) {
    const container = document.getElementById("itemsContainer");

    // Don't allow removing if only one item exists
    if (container.querySelectorAll(".item-row").length <= 1) {
      this.showMessage("At least one item is required", "error");
      return;
    }

    button.closest(".item-row").remove();
    this.updateTotal();
    this.updateAvailableUnits();
  },

  // Handle product selection
  onProductSelect(selectElement) {
    const itemRow = selectElement.closest(".item-row");
    const unitSelect = itemRow.querySelector(".item-unit-select");
    const qtyInput = itemRow.querySelector(".item-quantity");
    const option = selectElement.options[selectElement.selectedIndex];

    if (!option.value) {
      // Disable everything if no product selected
      qtyInput.disabled = true;
      unitSelect.disabled = true;
      unitSelect.innerHTML = '<option value="" disabled selected>Unit</option>';
      itemRow.querySelector(".item-price").value = "";
      itemRow.querySelector(".item-subtotal").textContent = "$ 0.000";
      return;
    }

    // Enable fields
    qtyInput.disabled = false;
    unitSelect.disabled = false;

    // Get product settings
    const productName = option.dataset.name || "";
    const isSeaweed = productName.toLowerCase().includes("seaweed");
    const middleUnit = option.dataset.middle || "BOX";
    const bagPrice = parseFloat(option.dataset.bag) || 0;
    const streamerPrice = parseFloat(option.dataset.streamer) || 0;
    const boxPrice = parseFloat(option.dataset.box) || 0;
    const ctnPrice = parseFloat(option.dataset.ctn) || 0;

    // Build dynamic unit list
    // 🔥 BAG is included if price > 0
    // 🔥 Seaweed products do not show FOC units
    unitSelect.innerHTML = `
      <option value="" disabled>Select Unit</option>
      ${bagPrice > 0 ? `<option value="BAG">BAG</option>` : ""}
      ${streamerPrice > 0 ? `<option value="STREAMER">STREAMER</option>` : ""}
      ${boxPrice > 0 ? `<option value="${middleUnit}">${middleUnit}</option>` : ""}
      ${ctnPrice > 0 ? `<option value="CTN">CTN</option>` : ""}
      ${!isSeaweed ? `<option value="FOC_BAG">FOC (BAG)</option>` : ""}
      ${!isSeaweed && streamerPrice > 0 ? `<option value="FOC_STREAMER">FOC (STREAMER)</option>` : ""}
      ${!isSeaweed ? `<option value="FOC_${middleUnit}">FOC (${middleUnit})</option>` : ""}
      ${!isSeaweed ? `<option value="FOC_CTN">FOC (CTN)</option>` : ""}
    `;


    // 🔥 AUTO-SELECT first available unit to reduce clicks
    this.updateAvailableUnits();
    const availableOption = Array.from(unitSelect.options).find(opt => opt.value && !opt.disabled);

    if (availableOption) {
      unitSelect.value = availableOption.value;
      this.onUnitChange(unitSelect);
    }


    // Reset price if no unit selected (though it should be now)
    if (!unitSelect.value) {
      itemRow.querySelector(".item-price").value = "";
      itemRow.querySelector(".item-unit-type").value = "";
      itemRow.querySelector(".item-foc-unit").value = "";
    }

    // 🔥 FOCUS QUANTITY for immediate entry
    setTimeout(() => {
      qtyInput.focus();
      qtyInput.select(); // Highlight value for easy overwrite
    }, 50);

    this.updateSubtotal(itemRow);
    this.updateTotal();
    this.updateAvailableUnits();
  },

  // Update FOC unit selection
  updateFOCUnit(selectElement) {
    const itemRow = selectElement.closest(".item-row");
    const focUnit = selectElement.value;
    itemRow.querySelector(".item-foc-unit").value = focUnit;
    this.updateSubtotal(itemRow);
    this.updateTotal();
  },

  // Handle unit type selection
  selectUnitType(button, event) {
    event.preventDefault();

    const itemRow = button.closest(".item-row");
    const unitType = button.dataset.type;
    const selectElement = itemRow.querySelector(".item-product");
    const productId = selectElement.value;

    if (!productId) {
      this.showMessage("Please select a product first", "error");
      return;
    }

    // Find the product
    const product = this.products.find((p) => p.id == productId);
    if (!product) {
      this.showMessage("Product not found", "error");
      return;
    }

    // Deselect all buttons and hide FOC dropdown by default
    itemRow.querySelectorAll(".unit-btn").forEach((btn) => {
      btn.style.background = "";
      btn.style.color = "";
    });
    itemRow.querySelector(".foc-unit-selector").style.display = "none";

    // if a regular unit (BOX/CTN) selected, enable FOC button
    if (unitType === "BOX" || unitType === "CTN") {
      const focBtn = itemRow.querySelector('.unit-btn[data-type="FOC"]');
      if (focBtn) focBtn.disabled = false;
    }

    // Select the clicked button
    if (unitType === "FOC") {
      button.style.background = "#ff9800";
      button.style.color = "white";
      // Show FOC unit selector
      itemRow.querySelector(".foc-unit-selector").style.display = "block";
    } else {
      button.style.background = "#007bff";
      button.style.color = "white";
    }

    // Set the price based on unit type
    let price = 0;
    if (unitType === "BOX") {
      price = product.box_price;
      itemRow.querySelector(".item-foc-unit").value = "BOX";
    } else if (unitType === "CTN") {
      price = product.ctn_price;
      itemRow.querySelector(".item-foc-unit").value = "CTN";
    } else if (unitType === "FOC") {
      price = 0;
      // FOC unit is selected via dropdown, default to what's in dropdown if already set
      if (!itemRow.querySelector(".item-foc-unit").value) {
        itemRow.querySelector(".item-foc-unit").value =
          itemRow.querySelector(".foc-unit-select").value || "BOX";
      }
    }

    itemRow.querySelector(".item-price").value = price.toFixed(3);
    itemRow.querySelector(".item-unit-type").value = unitType;
    // Update subtotal
    this.updateSubtotal(itemRow);
    this.updateTotal();
  },

  // Remove an item row
  reset(button) {
    const container = document.getElementById("itemsContainer");

    // Don't allow removing if only one item exists
    if (container.querySelectorAll(".item-row").length <= 1) {
      this.showMessage("At least one item is required", "error");
      return;
    }

    button.closest(".item-row").remove();
    this.updateTotal();
  },

  // Update subtotal for an item row
  updateSubtotal(itemRow) {
    const qty = parseFloat(itemRow.querySelector(".item-quantity").value) || 0;
    const price = parseFloat(itemRow.querySelector(".item-price").value) || 0;
    const subtotal = qty * price;

    const subtotalDiv = itemRow.querySelector(".item-subtotal");
    subtotalDiv.textContent = `$ ${subtotal.toFixed(3)}`;
  },

  // Update total amount
  updateTotal() {
    const itemRows = document.querySelectorAll(".item-row");
    let total = 0;

    itemRows.forEach((row) => {
      const qty = parseFloat(row.querySelector(".item-quantity").value) || 0;
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      total += qty * price;
      this.updateSubtotal(row);
    });

    document.getElementById("totalAmount").textContent =
      `$ ${total.toFixed(3)} = ៛ ${Math.round(total * 40) * 100}`;
  },

  // Submit the invoice form
  async submitForm() {
    // Use default customer name
    const customerName = "Customer";

    // Get all items
    const items = [];
    document.querySelectorAll(".item-row").forEach((row) => {
      const selectElement = row.querySelector(".item-product");
      const productId = selectElement.value;
      const quantity = parseFloat(row.querySelector(".item-quantity").value);
      const price = parseFloat(row.querySelector(".item-price").value) || 0;
      const unitType = row.querySelector(".item-unit-type").value;
      const originalUnit =
        row.querySelector(".item-foc-unit").value || unitType;

      // Allow items with unit type selected or FOC with base unit
      if (productId && quantity && unitType) {
        const product = this.products.find((p) => p.id == productId);
        items.push({
          productId: productId,
          name: product.product_name,
          sku: product.sku,
          description: product.description,
          quantity: quantity,
          price: price,
          unitType: unitType,
          originalUnit: originalUnit,
          subtotal: quantity * price,
        });
      }
    });

    if (items.length === 0) {
      this.showMessage(
        "Please add at least one item with a unit type or FOC selected",
        "error",
      );
      return false;
    }

    const hasFocItem = items.some((item) => item.unitType === "FOC");
    const hasBuyingUnit = items.some((item) => item.unitType !== "FOC");
    if (hasFocItem && !hasBuyingUnit) {
      this.showMessage("Can't save invoice with FOC only. Add buying unit first.", "error");
      return false;
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    // Prepare invoice data
    const invoiceData = {
      customerName: customerName,
      totalAmount: totalAmount,
      items: items,
    };

    try {
      // Send to server
      const response = await window.auth.fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(
          `<i class="fa-solid fa-circle-check"></i> Invoice ${result.invoiceNumber} saved successfully! Ready to print.`,
          "success",
        );

        this.displayReceipt(
          result.invoiceId,
          result.invoiceNumber,
          invoiceData,
        );
        return true;
      } else {
        const message = result?.error || result?.message || "Error saving invoice";
        this.showMessage("Error: " + message, "error");
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      this.showMessage("Error: " + error.message, "error");
      return false;
    }
  },

  // Helper function to format dates in Cambodia timezone (ICT - UTC+7)
  formatCambodiaDate(date) {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Phnom_Penh",
    };
    return date.toLocaleString("en-US", options);
  },

  // Display receipt preview for printing
  displayReceipt(invoiceId, invoiceNumber, invoiceData) {
    const today = new Date();
    const dateStr = this.formatCambodiaDate(today);

    let itemsHTML = "";
    invoiceData.items.forEach((item) => {
      const unitDisplay = item.unit_type === "FOC" ? item.originalUnit : item.unitType;
      const priceDisplay = item.unitType === "FOC" ? "FREE" : `$${item.price.toFixed(3)}`;
      const subtotalDisplay = item.unitType === "FOC" ? "$0.00" : `$${item.subtotal.toFixed(3)}`;

      itemsHTML += `
        <div class="item-line">
          <div class="item-line-main">
            <span>${item.sku} - ${item.name}</span>
            <span>${subtotalDisplay}</span>
          </div>
          <div class="item-line-details">
            <span>${item.quantity} ${unitDisplay} x ${priceDisplay}</span>
          </div>
        </div>
      `;
    });

    const receiptHTML = `
      <div class="receipt">
        <div class="receipt-header">
          <span class="store-name">Aprati Foods</span>
        </div>
        
        <div class="receipt-meta">
          <strong>Inv #:</strong> ${invoiceNumber}<br>
          <strong>Date:</strong> ${dateStr.split(',')[0]}<br>
          <strong>Time:</strong> ${dateStr.split(',')[1]}<br>
          <strong>Cashier:</strong> ${window.auth.getUser().fullName || 'Staff'}
        </div>

        <div class="receipt-items">
          ${itemsHTML}
        </div>

        <div class="receipt-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${invoiceData.totalAmount.toFixed(3)}</span>
          </div>
          <div class="total-grand">
            <span>TOTAL USD:</span>
            <span>$${invoiceData.totalAmount.toFixed(3)}</span>
          </div>
          <div class="total-row" style="font-size: 14px; margin-top: 5px;">
            <span>TOTAL KHR:</span>
            <span>៛ ${Math.round(invoiceData.totalAmount * 40) * 100}</span>
          </div>
        </div>

        <div class="receipt-footer">
          Thank you for your business!<br>
          Please come again.
        </div>
      </div>
    `;

    const receiptContainer = document.getElementById("receiptContainer");
    receiptContainer.innerHTML = receiptHTML;
    receiptContainer.style.display = "block";

    // Add print button
    const printBtn = document.createElement("button");
    printBtn.className = "btn btn-primary btn-print";
    printBtn.style.display = "block";
    printBtn.style.margin = "20px auto";
    printBtn.innerHTML = '<i class="fa-solid fa-print"></i> Print or Save as PDF';

    printBtn.onclick = () => {
      // Navigate to invoice detail page where user can print
      window.location.href = `/invoice/${invoiceId}`;
    };
    receiptContainer.appendChild(printBtn);

    // Scroll to receipt
    setTimeout(() => {
      receiptContainer.scrollIntoView({ behavior: "smooth" });
    }, 300);
  },

  // Show message to user
  showMessage(message, type) {
    const container = document.getElementById("messageContainer");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;

    // Add appropriate icon based on type
    const icon = type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    messageDiv.innerHTML = `<span>${icon}</span> <span>${message}</span>`;


    container.innerHTML = "";
    container.appendChild(messageDiv);

    // Auto-remove success messages after 5 seconds
    if (type === "success") {
      setTimeout(() => {
        if (messageDiv.parentNode) messageDiv.remove();
      }, 5000);
    }
  },
};

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => app.init());
