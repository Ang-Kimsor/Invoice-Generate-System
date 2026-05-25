// View invoice details and print
const invoiceDetail = {
  invoiceId: null,
  invoice: null,

  // Initialize the page
  init() {
    // Extract invoice ID from URL
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split('/');
    this.invoiceId = pathParts[pathParts.length - 1];

    if (!this.invoiceId || this.invoiceId === 'invoice-detail.html') {
      this.showMessage('Error: Invalid invoice ID', 'error');
      return;
    }

    this.loadInvoice();
  },

  // Load invoice details from server
  async loadInvoice() {
    const loadingContainer = document.getElementById('loadingContainer');
    const actionButtons = document.getElementById('actionButtons');
    const invoiceDisplay = document.getElementById('invoiceDisplay');

    loadingContainer.style.display = 'block';
    actionButtons.style.display = 'none';
    invoiceDisplay.innerHTML = '';

    try {
      const response = await window.auth.fetch(`/api/invoices/${this.invoiceId}`);
      const result = await response.json();

      loadingContainer.style.display = 'none';

      if (result.success) {
        this.invoice = result.data;
        this.displayInvoice();
        actionButtons.style.display = 'block';
      } else {
        this.showMessage('Invoice not found', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      loadingContainer.style.display = 'none';
      this.showMessage('Error loading invoice', 'error');
    }
  },

  // Helper function to format dates in Cambodia timezone (ICT - UTC+7)
  formatCambodiaDate(date) {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Phnom_Penh'
    };
    return new Date(date).toLocaleString('en-US', options);
  },

  // Display invoice in receipt format
  displayInvoice() {
    const invoice = this.invoice;
    const date = new Date(invoice.created_at);
    const dateStr = this.formatCambodiaDate(date);

    let itemsHTML = '';
    invoice.items.forEach(item => {
      const unitDisplay = item.unit_type === 'FOC' ? item.original_unit : item.unit_type;
      const priceDisplay = item.unit_type === 'FOC' ? 'FREE' : `$${parseFloat(item.price).toFixed(3)}`;
      const subtotalDisplay = item.unit_type === 'FOC' ? '$0.00' : `$${parseFloat(item.subtotal).toFixed(3)}`;

      itemsHTML += `
        <div class="item-line">
          <div class="item-line-main">
            <span>${item.sku ? item.sku + ' - ' : ''}${item.item_name}</span>
            <span>${subtotalDisplay}</span>
          </div>
          <div class="item-line-details">
            <span>${item.quantity} ${unitDisplay} x ${priceDisplay}</span>
          </div>
        </div>
      `;
    });

    const receiptHTML = `
      <div class="receipt" id="printableReceipt">
        <div class="receipt-header">
          <span class="store-name">Aprati Foods</span>
        </div>
        
        <div class="receipt-meta">
          <strong>Inv #:</strong> ${invoice.invoice_number}<br>
          <strong>Date:</strong> ${dateStr.split(',')[0]}<br>
          <strong>Time:</strong> ${dateStr.split(',')[1]}<br>
          <strong>Cashier:</strong> ${invoice.creator_name || 'Staff'}
        </div>

        <div class="receipt-items">
          ${itemsHTML}
        </div>

        <div class="receipt-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${parseFloat(invoice.total_amount).toFixed(3)}</span>
          </div>
          <div class="total-grand">
            <span>TOTAL USD:</span>
            <span>$${parseFloat(invoice.total_amount).toFixed(3)}</span>
          </div>
          <div class="total-row" style="font-size: 14px; margin-top: 5px;">
            <span>TOTAL KHR:</span>
            <span>៛ ${Math.round(invoice.total_amount * 40) * 100}</span>
          </div>
        </div>

        <div class="receipt-footer">
          Thank you for your business!<br>
          Please come again.
        </div>
      </div>
    `;

    document.getElementById('invoiceDisplay').innerHTML = receiptHTML;
  },

  // Print invoice
  printInvoice() {
    window.print();
  },

  // Delete invoice
  async deleteInvoice() {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await window.auth.fetch(`/api/invoices/${this.invoiceId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('<i class="fa-solid fa-circle-check"></i> Invoice deleted. Redirecting...', 'success');

        setTimeout(() => {
          window.location.href = '/invoices';
        }, 2000);
      } else {
        this.showMessage('Error: ' + result.message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showMessage('Error deleting invoice', 'error');
    }
  },

  // Show message
  showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    // Add appropriate icon based on type
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    messageDiv.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    
    container.innerHTML = '';
    container.appendChild(messageDiv);

    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (messageDiv.parentNode) messageDiv.remove();
      }, 5000);
    }
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => invoiceDetail.init());
