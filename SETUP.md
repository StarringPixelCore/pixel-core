# Setup Guide

## Prerequisites
- Node.js 18+ installed
- XAMPP running (MySQL and Apache)
- Gmail account (for email verification)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root by copying the example file:

```bash
cp .env.local.example .env.local
```

Then update it with your configuration:

```env
# Database Configuration (XAMPP MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cocoir_db
DB_PORT=3307

# Application URL (for email verification links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

**Note:** For Gmail, you need to:
1. Enable 2-Step Verification on your Google Account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use this App Password instead of your regular password

### 3. Set Up Database

1. Start XAMPP (Apache and MySQL)
2. Go to `http://localhost/phpmyadmin`
3. Import the SQL file:
   - Go to `Import` tab
   - Select `database/cocoir_db.sql`
   - Click `Go`

Or use MySQL command line:
```bash
mysql -u root < database/cocoir_db.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

---

## Available Pages

### Public Pages
- **Home:** `/` - Welcome page with link to products
- **Products:** `/products` - Browse coconut coir products
- **Register:** `/register` - Create a new account
- **Login:** `/login` - Login to existing account
- **Email Verification:** `/verify-email?token=...` - Verify email after registration

### Protected Pages (Requires Login)
- **Profile:** `/profile` - User profile, edit info, change password, delete account
- **Cart:** `/cart` - Shopping cart

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email?token=...` - Verify email

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile` - Change password
- `DELETE /api/profile` - Delete account

### Cart (existing)
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

---

## Features Implemented

### ✅ Registration Page
- Email validation
- Password strength validation
- Confirm password match
- Form validation (frontend + backend)
- SMTP email verification via Gmail
- User role assignment (Buyer by default)

### ✅ Login Page
- Email and password validation
- Session-based authentication
- Email verification required before login
- Per-field error messages

### ✅ Profile Page
- View user information
- Edit user information
- Change password
- Delete account (Buyers only)
- Role-based access control
  - **Buyers:** Can view info, edit, change password, delete account
  - **Sellers:** Can view info, edit, change password (cannot delete account)

### ✅ Navbar Updates
- Navigation links moved to left (Home, Products)
- Cart icon on right side
- User profile icon on right side (when logged in)
- Login button shows when not logged in
- Active page highlighting

---

## Database Schema

The application uses the following tables:

### users
- id, email, first_name, last_name
- password, address, mobile_number
- role (Buyer/Seller), profile_picture
- is_verified, verify_token, reset_token
- created_at

### products
- id, name, description, price
- stock, category, image_url, created_at

### cart
- id, user_id, created_at

### cart_items
- id, cart_id, product_id
- quantity, price, added_at

### orders
- id, user_id, receive_method, delivery_address
- payment_method, payment_status, order_status
- subtotal, shipping_fee, total_amount
- notes, created_at, updated_at

### order_items
- id, order_id, product_id
- product_name, product_image
- quantity, unit_price, subtotal

---

## Form Validation Rules

### Register Form
- **Email:** Required, must be valid email format
- **First Name:** Required, minimum 2 characters
- **Last Name:** Required, minimum 2 characters
- **Password:** Required, minimum 8 characters
- **Confirm Password:** Must match password
- **Address:** Required, minimum 5 characters
- **Mobile Number:** Required, 10-15 digits

### Login Form
- **Email:** Required, must be valid email format
- **Password:** Required

### Password Change
- **Current Password:** Required, must be correct
- **New Password:** Required, minimum 8 characters
- **Confirm Password:** Must match new password

---

## Troubleshooting

### Email not sending?
- Check GMAIL_USER and GMAIL_PASSWORD in .env.local
- Verify App Password is used (not regular password)
- Check Gmail account has 2-Step Verification enabled

### Database connection fails?
- Ensure XAMPP MySQL is running
- Verify DB credentials in .env.local
- Check port 3307 (or adjust if using different port)

### Session not persisting?
- Cookies must be enabled in browser
- Check browser console for errors
- Verify secure flag (only http://localhost works locally)

---

## Next Steps / Future Enhancements

1. Add password reset functionality
2. Implement seller dashboard
3. Add order management system
4. Implement payment gateway integration
5. Add user avatar/profile picture upload
6. Add email notifications for orders
7. Implement review and rating system
8. Add inventory management for sellers
