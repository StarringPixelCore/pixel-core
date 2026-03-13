CREATE TABLE tblusers (
    id              int(11)             NOT NULL AUTO_INCREMENT,
    first_name      VARCHAR(100)        NOT NULL,
    last_name       VARCHAR(100)        NOT NULL,
    email           VARCHAR(255)        NOT NULL,
    address         TEXT,
    mobile_number   VARCHAR(20),
    password        VARCHAR(255)        NOT NULL,
    role            varchar(50)         DEFAULT 'Buyer',
    profile_picture VARCHAR(255)        DEFAULT 'default.jpg',
    is_verified     int(11)             NOT NULL DEFAULT 0,
    verify_token    VARCHAR(255)        NOT NULL,
    reset_token     varchar(255)        DEFAULT NULL,
    reset_token_expires_at  DATETIME    DEFAULT NULL,
    created_at      DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
);

CREATE TABLE tblproducts (
    id          INT AUTO_INCREMENT,
    name        VARCHAR(255)        NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2)      NOT NULL,
    stock       INT                 NOT NULL DEFAULT 0,
    category    VARCHAR(100),
    image_url   VARCHAR(255),
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id)
);

CREATE TABLE tblcart (
    id          INT AUTO_INCREMENT,
    user_id     INT             NOT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);
 
CREATE TABLE tblcart_items (
    id          INT AUTO_INCREMENT,
    cart_id     INT             NOT NULL,
    product_id  INT             NOT NULL,
    quantity    INT             NOT NULL DEFAULT 1,
    added_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    CONSTRAINT fk_cartitem_cart    FOREIGN KEY (cart_id)    REFERENCES cart (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cartitem_product FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
);

CREATE TABLE tblorders (
    id              INT AUTO_INCREMENT,
    user_id         INT             NOT NULL,
 
    -- Receive method
    receive_method  ENUM('pickup', 'delivery') NOT NULL DEFAULT 'delivery',
    delivery_address TEXT,                          -- filled when receive_method = delivery
 
    -- Payment
    payment_method  ENUM('cash', 'credit_debit_card', 'gcash', 'maya') NOT NULL,
    payment_status  ENUM('pending', 'paid', 'failed', 'refunded')       NOT NULL DEFAULT 'pending',
 
    -- Order status
    order_status    ENUM('pending', 'confirmed', 'processing',
                         'ready_for_pickup', 'out_for_delivery',
                         'delivered', 'cancelled')                       NOT NULL DEFAULT 'pending',
 
    -- Totals
    subtotal        DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    shipping_fee    DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
 
    notes           TEXT,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
);

CREATE TABLE tblorder_items (
    id              INT AUTO_INCREMENT,
    order_id        INT             NOT NULL,
    product_id      INT             NOT NULL,
    product_name    VARCHAR(255)    NOT NULL,   -- snapshot at time of purchase
    product_image   VARCHAR(255),               -- snapshot at time of purchase
    quantity        INT             NOT NULL,
    unit_price      DECIMAL(10, 2)  NOT NULL,   -- snapshot at time of purchase
    subtotal        DECIMAL(10, 2)  NOT NULL,   -- quantity * unit_price
 
    PRIMARY KEY (id),
    CONSTRAINT fk_orderitem_order   FOREIGN KEY (order_id)   REFERENCES orders (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_orderitem_product FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT
);

CREATE TABLE tblpayment_details (
    id                  INT AUTO_INCREMENT,
    order_id            INT             NOT NULL,
 
    -- For Credit/Debit Card
    cardholder_name     VARCHAR(255),
    card_last4          CHAR(4),
    card_expiry         VARCHAR(7),             -- e.g. 12/2027
 
    -- For GCash / Maya
    ewallet_number      VARCHAR(20),
    ewallet_reference   VARCHAR(100),
 
    -- For Cash
    amount_tendered     DECIMAL(10, 2),
    change_due          DECIMAL(10, 2),
 
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    UNIQUE KEY uq_payment_order (order_id),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE
);

CREATE TABLE tbltransactions (
    id                  INT AUTO_INCREMENT,
    order_id            INT             NOT NULL,
    user_id             INT             NOT NULL,
    transaction_type    ENUM('purchase', 'refund', 'cancellation') NOT NULL DEFAULT 'purchase',
    amount              DECIMAL(10, 2)  NOT NULL,
    payment_method      ENUM('cash', 'credit_debit_card', 'gcash', 'maya') NOT NULL,
    status              ENUM('success', 'failed', 'pending', 'refunded')   NOT NULL DEFAULT 'pending',
    reference_number    VARCHAR(100)    UNIQUE,     -- for tracking/receipts
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    PRIMARY KEY (id),
    CONSTRAINT fk_txn_order FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_txn_user  FOREIGN KEY (user_id)  REFERENCES users (id)
        ON DELETE CASCADE
);