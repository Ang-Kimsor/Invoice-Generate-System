<div align="center">
  <h1>🧾 Invoice Generate System 🧾</h1>
  <p>A fast, modern invoice and receipt management system featuring thermal printer layout, multi-tiered unit pricing, multi-sheet Excel export, and role-based access control. Built with Node.js, Express, and PostgreSQL.</p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-v18+-green?logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-v4.18-lightgrey?logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/PostgreSQL-5432-blue?logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/JWT-Authentication-orange?logo=jsonwebtokens" alt="JWT" />
    <img src="https://img.shields.io/badge/Receipt-80mm%20Thermal-red?logo=print" alt="Receipt" />
  </p>
</div>

---

## Table of Contents 📑

- [About The Project 📖](#about-the-project-)
- [Key Features ✨](#key-features-)
- [User Roles & Permissions 🧑‍💻](#user-roles--permissions-)
- [Tools & Technologies 🛠️](#tools--technologies-️)
- [Getting Started 🚀](#getting-started-)
  - [Prerequisites ✅](#prerequisites-)
  - [Installation & Setup 💾](#installation--setup-)
  - [Default Credentials 🔐](#default-credentials-)
- [Folder Structure 📂](#folder-structure-)
- [API Reference 🔌](#api-reference-)
- [Contributors 🤝](#contributors-)
- [Contact 📬](#contact-)
- [Acknowledgements 🙏](#acknowledgements-)

---

## About The Project 📖

**Invoice Generate System** is a streamlined point-of-sale and invoicing web application tailored for retail and wholesale operations. It handles product cataloging across flexible unit pricing (bags, streamers, boxes, cartons), automated sequence numbering in Cambodia timezone (`INV-YYYYMMDD-XXX`), instant 80mm thermal receipt printing, and comprehensive multi-sheet Excel reporting.

---

## Key Features ✨

- **⚡ Fast Invoice Generation:** Dynamic item addition with real-time subtotal and total calculations.
- **🏷️ Multi-Unit Pricing:** Configurable pricing tiers per product (`BAG`, `STREAMER`, `BOX`, `LINER`, `CTN`, `FOC`).
- **🎁 FOC (Free Of Charge) Support:** Built-in validation ensuring promotional items are paired with purchase units.
- **🖨️ Thermal Receipt Printing:** Optimized 80mm thermal receipt print format with clean print CSS rules.
- **📅 Timezone-Aware Invoicing:** Automatic invoice numbering (`INV-YYYYMMDD-001`) synced to Cambodia timezone (`Asia/Phnom_Penh`, UTC+7).
- **📊 Multi-Sheet Excel Reports:** Download styled `.xlsx` workbooks containing separate sheets for Invoices, Invoice Items, and Product Catalog.
- **🔐 Secure RBAC Authentication:** JWT token authentication with bcrypt password encryption for `ADMIN` and `CASHIER` roles.

---

## User Roles & Permissions 🧑‍💻

| Feature | Admin 👑 | Cashier 🧑‍💼 |
| :--- | :---: | :---: |
| **Create Invoices & Print Receipts** | ✅ | ✅ |
| **View Own Invoices** | ✅ | ✅ |
| **View All Invoices & Order History** | ✅ | ❌ |
| **Delete Invoices** | ✅ | ❌ |
| **Product Catalog Management (CRUD)** | ✅ | ❌ |
| **Analytics Dashboard & Reports** | ✅ | ❌ |
| **Multi-Sheet Excel Data Export** | ✅ | ❌ |
| **User & Staff Management** | ✅ | ❌ |

---

## Tools & Technologies 🛠️

- **Backend:** Node.js, Express.js (v4), PostgreSQL (`pg` pool), JWT (`jsonwebtoken`), Bcryptjs
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3, Font Awesome 6
- **Data Export:** ExcelJS (multi-sheet workbook generator)
- **Database:** PostgreSQL (with auto table creation & indexing)

---

## Getting Started 🚀

### Prerequisites ✅

- **Node.js** (v18.x or later) & **npm**
- **PostgreSQL** (v14+) running locally or on a remote server

---

### Installation & Setup 💾

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ang-Kimsor/Invoice-Generate-System.git
   cd Invoice-Generate-System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL database credentials:
   ```env
   # PostgreSQL Database Configuration
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=invoice_db
   PGUSER=postgres
   PGPASSWORD=your_password
   # PGSSL=true

   # Server & Application Configuration
   PORT=3000
   NODE_ENV=development
   SHOP_NAME="Invoice Generate System"
   CURRENCY_SYMBOL=$
   RECEIPT_WIDTH=80
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. **Prepare Database & Create Initial Admin:**
   Create the database in PostgreSQL (e.g. `CREATE DATABASE invoice_db;`), then run:
   ```bash
   node createAdmin.js
   ```
   *(Tables and indexes are automatically created upon server boot)*

5. **Start the Application:**
   ```bash
   # Development mode (auto-reload with nodemon)
   npm run dev

   # Production mode
   npm start
   ```
   Open your browser at: `http://localhost:3000`

---

### Default Credentials 🔐

| Field | Value |
| :--- | :--- |
| **Username** | `admin` |
| **Password** | `password` |
| **Role** | `ADMIN` |

> [!NOTE]
> Please change the default password after your first login via the Users Management menu.

---

## Folder Structure 📂

```text
├── /config
│   └── db.js                 # PostgreSQL connection pool & env loader
├── /middleware
│   └── auth.js               # JWT verification & admin-only middleware
├── /models
│   ├── Invoice.js            # Invoice & Product database operations
│   └── User.js               # User authentication & CRUD operations
├── /public
│   ├── /css                  # Stylesheets & thermal print styling
│   ├── /js                   # Frontend client controllers & auth
│   ├── index.html            # Create Invoice screen
│   ├── invoices.html         # Invoice history listing
│   ├── invoice-detail.html   # Invoice detail & receipt print preview
│   ├── products.html         # Product management interface
│   ├── report.html           # Analytics dashboard & Excel export
│   └── users.html            # User & staff management
├── /routes
│   ├── auth.js               # Login & profile routes
│   ├── invoices.js           # Invoice CRUD & Excel export endpoints
│   ├── products.js           # Product catalog endpoints
│   └── users.js              # User management endpoints
├── createAdmin.js            # Admin user provisioning script
├── invoice_db.sql            # Database schema backup dump
├── package.json              # Project dependencies & scripts
├── server.js                 # Express server & table auto-migration
└── README.md                 # Project documentation
```

---

## API Reference 🔌

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current authenticated user profile |
| `GET` | `/api/invoices` | Authenticated | List invoices (filtered for Cashiers, all for Admins) |
| `POST` | `/api/invoices` | Authenticated | Create new invoice with line items |
| `GET` | `/api/invoices/:id` | Authenticated | Get single invoice with item breakdown |
| `DELETE` | `/api/invoices/:id` | Admin Only | Delete invoice record |
| `GET` | `/api/invoices/export-all` | Admin Only | Download multi-sheet Excel report (`.xlsx`) |
| `GET` | `/api/products` | Authenticated | Get list of all catalog products |
| `POST` | `/api/products` | Admin Only | Add a new product to catalog |
| `PUT` | `/api/products/:id` | Admin Only | Update existing product details |
| `DELETE` | `/api/products/:id` | Admin Only | Remove product from catalog |
| `GET` | `/api/users` | Admin Only | List all staff & admin accounts |
| `POST` | `/api/users` | Admin Only | Create new cashier or admin account |
| `PUT` | `/api/users/:id` | Admin Only | Update user profile or password |
| `DELETE` | `/api/users/:id` | Admin Only | Delete user account |

---

## Contributors 🤝

Contributions, issues, and feature requests are welcome! Feel free to check the repository, fork the project, and submit a pull request.

<a href="https://github.com/Ang-Kimsor/Invoice-Generate-System/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Ang-Kimsor/Invoice-Generate-System" alt="Contributors" />
</a>

---

## Contact 📬

**Ang Kimsor**

- Email - [angkimsor@gmail.com](mailto:angkimsor@gmail.com)
- Phone ☎️ +85587932289
- Project Link: [https://github.com/Ang-Kimsor/Invoice-Generate-System](https://github.com/Ang-Kimsor/Invoice-Generate-System)

---

## Acknowledgements 🙏

- [Express.js](https://expressjs.com/) for the minimalist Node.js web framework.
- [ExcelJS](https://github.com/exceljs/exceljs) for multi-sheet spreadsheet generation.
- [node-postgres (pg)](https://node-postgres.com/) for PostgreSQL client connectivity.
- [Font Awesome](https://fontawesome.com/) for icons.
