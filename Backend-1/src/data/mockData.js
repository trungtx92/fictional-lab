// In-memory mock data matching the schema in the Technical Requirements Document.
// Replace this module with real PostgreSQL queries when the database is wired up.

export const customers = [
  { customer_id: 1, first_name: "Alice", last_name: "Nguyen", email: "alice.nguyen@example.com", phone: "+1-202-555-0101", address: "12 Maple St, Springfield", created_at: "2024-01-15T08:30:00Z" },
  { customer_id: 2, first_name: "Brian", last_name: "Tran", email: "brian.tran@example.com", phone: "+1-202-555-0102", address: "88 Oak Ave, Springfield", created_at: "2024-01-20T09:10:00Z" },
  { customer_id: 3, first_name: "Carla", last_name: "Ramirez", email: "carla.ramirez@example.com", phone: "+1-202-555-0103", address: "5 Birch Rd, Riverton", created_at: "2024-02-02T14:00:00Z" },
  { customer_id: 4, first_name: "David", last_name: "Kim", email: "david.kim@example.com", phone: "+1-202-555-0104", address: "271 Cedar Blvd, Riverton", created_at: "2024-02-11T11:45:00Z" },
  { customer_id: 5, first_name: "Elena", last_name: "Petrova", email: "elena.petrova@example.com", phone: "+1-202-555-0105", address: "9 Elm Ct, Lakeside", created_at: "2024-03-01T16:20:00Z" },
  { customer_id: 6, first_name: "Farid", last_name: "Haidari", email: "farid.haidari@example.com", phone: "+1-202-555-0106", address: "40 Pine Way, Lakeside", created_at: "2024-03-18T10:05:00Z" },
  { customer_id: 7, first_name: "Grace", last_name: "Okafor", email: "grace.okafor@example.com", phone: "+1-202-555-0107", address: "163 Spruce Dr, Hilltown", created_at: "2024-04-09T13:15:00Z" },
  { customer_id: 8, first_name: "Hiro", last_name: "Tanaka", email: "hiro.tanaka@example.com", phone: "+1-202-555-0108", address: "22 Aspen Pl, Hilltown", created_at: "2024-04-27T17:40:00Z" },
  { customer_id: 9, first_name: "Trung", last_name: "Pham", email: "trung.pham@example.com", phone: "+1-202-555-0108", address: "8 Gratz St, Hilltown", created_at: "2024-04-27T17:40:00Z" },
];

export const stores = [
  { store_id: 1, store_name: "Downtown Springfield", region: "North", address: "100 Main St, Springfield", manager_name: "Monica Lee" },
  { store_id: 2, store_name: "Riverton Plaza", region: "North", address: "45 River Rd, Riverton", manager_name: "Owen Scott" },
  { store_id: 3, store_name: "Lakeside Outlet", region: "South", address: "8 Harbor Ave, Lakeside", manager_name: "Priya Shah" },
  { store_id: 4, store_name: "Hilltown Market", region: "South", address: "300 Summit Dr, Hilltown", manager_name: "Quentin Ross" },
];

export const products = [
  { product_id: 1, sku: "SKU-1001", product_name: "Wireless Mouse", category: "Electronics", unit_price: 24.99, is_active: true, created_at: "2023-11-01T00:00:00Z" },
  { product_id: 2, sku: "SKU-1002", product_name: "Mechanical Keyboard", category: "Electronics", unit_price: 79.99, is_active: true, created_at: "2023-11-01T00:00:00Z" },
  { product_id: 3, sku: "SKU-1003", product_name: "USB-C Hub", category: "Electronics", unit_price: 34.5, is_active: true, created_at: "2023-11-05T00:00:00Z" },
  { product_id: 4, sku: "SKU-1004", product_name: "27in Monitor", category: "Electronics", unit_price: 249.0, is_active: true, created_at: "2023-11-10T00:00:00Z" },
  { product_id: 5, sku: "SKU-2001", product_name: "Ceramic Mug", category: "Home & Kitchen", unit_price: 9.5, is_active: true, created_at: "2023-12-01T00:00:00Z" },
  { product_id: 6, sku: "SKU-2002", product_name: "French Press", category: "Home & Kitchen", unit_price: 29.99, is_active: true, created_at: "2023-12-01T00:00:00Z" },
  { product_id: 7, sku: "SKU-2003", product_name: "Cutting Board Set", category: "Home & Kitchen", unit_price: 19.75, is_active: true, created_at: "2023-12-05T00:00:00Z" },
  { product_id: 8, sku: "SKU-3001", product_name: "Yoga Mat", category: "Sports & Outdoors", unit_price: 22.0, is_active: true, created_at: "2024-01-02T00:00:00Z" },
  { product_id: 9, sku: "SKU-3002", product_name: "Water Bottle 1L", category: "Sports & Outdoors", unit_price: 14.25, is_active: true, created_at: "2024-01-02T00:00:00Z" },
  { product_id: 10, sku: "SKU-3003", product_name: "Resistance Band Set", category: "Sports & Outdoors", unit_price: 17.5, is_active: true, created_at: "2024-01-10T00:00:00Z" },
  { product_id: 11, sku: "SKU-4001", product_name: "Notebook (A5)", category: "Office", unit_price: 6.99, is_active: true, created_at: "2024-02-01T00:00:00Z" },
  { product_id: 12, sku: "SKU-4002", product_name: "Desk Lamp", category: "Office", unit_price: 39.99, is_active: false, created_at: "2024-02-01T00:00:00Z" },
];

// Each entry: transaction fields + a list of { product_id, quantity }.
// unit_price / line_total / total_amount are derived below at load time,
// mirroring how the real backend snapshots price at time of sale.
const rawTransactions = [
  { transaction_id: 1, customer_id: 1, store_id: 1, transaction_date: "2024-05-01T10:15:00Z", payment_method: "card", status: "completed", items: [{ product_id: 1, quantity: 1 }, { product_id: 3, quantity: 1 }] },
  { transaction_id: 2, customer_id: 2, store_id: 1, transaction_date: "2024-05-02T11:00:00Z", payment_method: "cash", status: "completed", items: [{ product_id: 5, quantity: 4 }, { product_id: 6, quantity: 1 }] },
  { transaction_id: 3, customer_id: 3, store_id: 2, transaction_date: "2024-05-02T15:30:00Z", payment_method: "card", status: "completed", items: [{ product_id: 2, quantity: 1 }] },
  { transaction_id: 4, customer_id: 1, store_id: 1, transaction_date: "2024-05-05T09:45:00Z", payment_method: "wallet", status: "completed", items: [{ product_id: 8, quantity: 2 }, { product_id: 9, quantity: 2 }] },
  { transaction_id: 5, customer_id: 4, store_id: 2, transaction_date: "2024-05-06T13:20:00Z", payment_method: "card", status: "refunded", items: [{ product_id: 4, quantity: 1 }] },
  { transaction_id: 6, customer_id: 5, store_id: 3, transaction_date: "2024-05-07T12:00:00Z", payment_method: "card", status: "completed", items: [{ product_id: 7, quantity: 1 }, { product_id: 11, quantity: 3 }] },
  { transaction_id: 7, customer_id: 6, store_id: 3, transaction_date: "2024-05-08T16:40:00Z", payment_method: "cash", status: "completed", items: [{ product_id: 10, quantity: 1 }] },
  { transaction_id: 8, customer_id: 2, store_id: 1, transaction_date: "2024-05-10T10:10:00Z", payment_method: "card", status: "completed", items: [{ product_id: 1, quantity: 2 }, { product_id: 2, quantity: 1 }] },
  { transaction_id: 9, customer_id: 7, store_id: 4, transaction_date: "2024-05-11T14:05:00Z", payment_method: "card", status: "completed", items: [{ product_id: 12, quantity: 1 }, { product_id: 11, quantity: 2 }] },
  { transaction_id: 10, customer_id: 8, store_id: 4, transaction_date: "2024-05-12T17:25:00Z", payment_method: "wallet", status: "completed", items: [{ product_id: 9, quantity: 3 }] },
  { transaction_id: 11, customer_id: 3, store_id: 2, transaction_date: "2024-05-14T09:00:00Z", payment_method: "card", status: "voided", items: [{ product_id: 6, quantity: 1 }, { product_id: 5, quantity: 2 }] },
  { transaction_id: 12, customer_id: 5, store_id: 3, transaction_date: "2024-05-15T11:50:00Z", payment_method: "card", status: "completed", items: [{ product_id: 4, quantity: 1 }, { product_id: 3, quantity: 1 }] },
  { transaction_id: 13, customer_id: 6, store_id: 3, transaction_date: "2024-05-16T15:15:00Z", payment_method: "cash", status: "completed", items: [{ product_id: 8, quantity: 1 }] },
  { transaction_id: 14, customer_id: 4, store_id: 2, transaction_date: "2024-05-18T10:30:00Z", payment_method: "card", status: "completed", items: [{ product_id: 2, quantity: 1 }, { product_id: 1, quantity: 1 }, { product_id: 3, quantity: 1 }] },
  { transaction_id: 15, customer_id: 7, store_id: 4, transaction_date: "2024-05-20T13:40:00Z", payment_method: "card", status: "completed", items: [{ product_id: 7, quantity: 2 }, { product_id: 6, quantity: 1 }] },
  { transaction_id: 16, customer_id: 9, store_id: 4, transaction_date: "2024-05-20T13:40:00Z", payment_method: "card", status: "completed", items: [{ product_id: 7, quantity: 2 }, { product_id: 6, quantity: 1 }] },
];

const productById = Object.fromEntries(products.map((p) => [p.product_id, p]));

let itemIdSeq = 1;
export const transactionItems = [];
export const transactions = rawTransactions.map(({ items, ...txn }) => {
  let total = 0;
  for (const { product_id, quantity } of items) {
    const product = productById[product_id];
    const unit_price = product.unit_price;
    const line_total = Math.round(unit_price * quantity * 100) / 100;
    total += line_total;
    transactionItems.push({
      transaction_item_id: itemIdSeq++,
      transaction_id: txn.transaction_id,
      product_id,
      quantity,
      unit_price,
      line_total,
    });
  }
  return {
    ...txn,
    total_amount: Math.round(total * 100) / 100,
    created_at: txn.transaction_date,
  };
});
