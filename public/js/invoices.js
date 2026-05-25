// Helper function to format dates in Cambodia timezone (ICT - UTC+7)
function formatCambodiaDateTime(date) {
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
}

// View all invoices
const invoices = {
  // Initialize the page
  init() {
    this.loadInvoices();
  },

  // Load all invoices from server
  async loadInvoices() {
    const loadingContainer = document.getElementById('loadingContainer');
    const invoicesList = document.getElementById('invoicesList');
    const emptyMessage = document.getElementById('emptyMessage');

    loadingContainer.style.display = 'block';
    invoicesList.innerHTML = '';
    emptyMessage.style.display = 'none';

    try {
      const response = await window.auth.fetch('/api/invoices');
      const result = await response.json();

      loadingContainer.style.display = 'none';

      if (result.success && result.count > 0) {
        // Display invoices
        result.data.forEach(invoice => {
          const listItem = document.createElement('div');
          listItem.className = 'invoice-item';
          listItem.style.padding = '1.25rem 1.5rem';
          listItem.style.borderBottom = '1px solid var(--border)';
          listItem.style.display = 'flex';
          listItem.style.justifyContent = 'space-between';
          listItem.style.alignItems = 'center';
          listItem.style.transition = 'background 0.2s ease';

          const date = new Date(invoice.created_at);
          const dateTimeStr = formatCambodiaDateTime(date);

          listItem.innerHTML = `
            <div class="invoice-info">
              <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">${invoice.invoice_number}</h3>
              <div style="display: flex; gap: 1.5rem; font-size: 0.8125rem; color: var(--text-muted);">
                <span><i class="fa-solid fa-user"></i> ${invoice.customer_name}</span>
                <span><i class="fa-solid fa-calendar-days"></i> ${dateTimeStr}</span>

              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 2rem;">
              <div style="text-align: right;">
                <span style="display: block; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">Amount</span>
                <span style="font-size: 1.125rem; font-weight: 700; color: var(--primary);">$${parseFloat(invoice.total_amount).toFixed(3)}</span>
              </div>
              <div class="invoice-actions" style="display: flex; gap: 0.5rem;">
                <a href="/invoice/${invoice.id}" class="btn" style="background: #f1f5f9; color: var(--text-main); font-size: 0.8125rem; padding: 0.5rem 1rem; border: 1px solid var(--border);">Details</a>
                <button class="btn btn-danger admin-only" onclick="invoices.deleteInvoice(${invoice.id})" style="font-size: 0.8125rem; padding: 0.5rem 1rem;">
                  Delete
                </button>
              </div>
            </div>
          `;

          invoicesList.appendChild(listItem);
        });
      } else {
        // Show empty message
        emptyMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      loadingContainer.style.display = 'none';
      this.showMessage('Error loading invoices', 'error');
    }
  },

  // Delete invoice
  async deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const response = await window.auth.fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('<i class="fa-solid fa-circle-check"></i> Invoice deleted successfully', 'success');

        setTimeout(() => {
          this.loadInvoices();
        }, 1500);
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
    if (!container) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-triangle-exclamation"></i>';
    messageDiv.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

    
    container.innerHTML = '';
    container.appendChild(messageDiv);

    if (type === 'success') {
      setTimeout(() => {
        if (messageDiv.parentNode) messageDiv.remove();
      }, 5000);
    }
  }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => invoices.init());
