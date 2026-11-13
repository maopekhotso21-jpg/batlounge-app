// Lists the nine South African provinces accepted by supplier forms.
export const PROVINCES = [
  'Eastern Cape','Free State','Gauteng','KwaZulu-Natal',
  'Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'
];

// Lists the supported fruit box sizes.
export const BOX_SIZES = ['Small','Medium','Large'];

// Lists the statuses in the order workflow.
export const ORDER_STATUSES = [
  'Pending','Confirmed','Processing',
  'Ready for Collection/Delivery','Completed','Cancelled'
];

// Maps order statuses to Tailwind badge color classes.
export const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Confirmed': 'bg-blue-100 text-blue-800',
  'Processing': 'bg-indigo-100 text-indigo-800',
  'Ready for Collection/Delivery': 'bg-purple-100 text-purple-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

// Maps vendor statuses to Tailwind badge color classes.
export const VENDOR_STATUS_COLORS = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-200 text-gray-700'
};
