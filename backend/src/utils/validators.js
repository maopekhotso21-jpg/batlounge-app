// Lists the province names accepted by supplier validation.
const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

// Lists the box sizes that can be assigned to products.
const BOX_SIZES = ['Small', 'Medium', 'Large'];

// Lists every status allowed in the order workflow.
const ORDER_STATUSES = [
  'Pending', 'Confirmed', 'Processing',
  'Ready for Collection/Delivery', 'Completed', 'Cancelled'
];

// Lists the standard fruit names supported by the application.
const ALLOWED_FRUITS = ['Apples', 'Bananas', 'Oranges', 'Mangoes', 'Grapes'];

// Returns true when a value can be converted to a number greater than zero.
const isPositiveNumber = (v) => !isNaN(v) && Number(v) > 0;
// Returns true when a value can be converted to zero or a positive number.
const isNonNegativeNumber = (v) => !isNaN(v) && Number(v) >= 0;
// Returns true for a string containing at least one non-whitespace character.
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
// Checks whether a province exactly matches one of the allowed province names.
const isValidProvince = (p) => PROVINCES.includes(p);
// Checks whether a box size exactly matches Small, Medium, or Large.
const isValidBoxSize = (s) => BOX_SIZES.includes(s);
// Checks whether an order status is part of the supported workflow.
const isValidOrderStatus = (s) => ORDER_STATUSES.includes(s);
// Performs a simple shape check for an email address.
const isValidEmail = (e) =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// Performs a simple length and character check for a telephone number.
const isValidPhone = (p) =>
  typeof p === 'string' && /^[0-9+\-\s]{6,20}$/.test(p);

// Error type used when a request fails a validation or business rule.
// Its status property lets error middleware choose the HTTP response code.
class HttpError extends Error {
  // Creates an HTTP-aware error with a message and optional status code.
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// Throws an HttpError when a required condition is false.
const assert = (cond, message, status = 400) => {
  if (!cond) throw new HttpError(message, status);
};

// Exports shared constants, validators, and the HTTP assertion helper.
module.exports = {
  PROVINCES, BOX_SIZES, ORDER_STATUSES, ALLOWED_FRUITS,
  isPositiveNumber, isNonNegativeNumber, isNonEmptyString,
  isValidProvince, isValidBoxSize, isValidOrderStatus,
  isValidEmail, isValidPhone, HttpError, assert
};