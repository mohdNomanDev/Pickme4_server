import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  title: { type: String, required: true },
  city: { type: String, required: true },
  street: { type: String, required: true },
  buildingNumber: { type: String },
  floor: { type: String },
  apartment: { type: String },
  postalCode: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  notes: { type: String },
  isDefault: { type: Boolean, default: false },
  address: { type: String, required: true },
  state: { type: String }
}, { _id: false });

const paymentMethodSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  last4: { type: String },
  brand: { type: String },
  isDefault: { type: Boolean, default: false },
  phone: { type: String }
}, { _id: false });

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  notes: { type: String },
  addons: [{
    name: { type: String },
    price: { type: Number }
  }]
}, { _id: false });

const cartSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  deliveryFee: { type: Number, default: 0 },
  items: [cartItemSchema]
}, { _id: false });

const activeOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  itemsCount: { type: Number, required: true },
  status: { type: String, required: true },
  statusLabel: { type: String },
  estimatedDeliveryTime: { type: String },
  remainingTime: { type: Number },
  progress: { type: Number },
  deliveryType: { type: String },
  rider: {
    id: { type: String },
    name: { type: String },
    phone: { type: String },
    vehicle: { type: String },
    plateNumber: { type: String },
    rating: { type: Number },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  actions: {
    canContact: { type: Boolean },
    canTrack: { type: Boolean }
  },
  createdAt: { type: Date }
}, { _id: false });

const orderHistorySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  status: { type: String, required: true },
  statusLabel: { type: String },
  itemsCount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
  actions: {
    canReorder: { type: Boolean },
    canRate: { type: Boolean },
    canRetry: { type: Boolean }
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true },
    full: { type: String, required: true }
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  avatar: { type: String },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  walletBalance: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  addresses: [addressSchema],
  paymentMethods: [paymentMethodSchema],
  preferences: {
    favoriteCuisines: [String],
    allergies: [String],
    notifications: {
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true }
    }
  },
  cart: [cartSchema],
  activeOrders: [activeOrderSchema],
  orderHistory: [orderHistorySchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name if not provided or to ensure consistency
userSchema.virtual('fullName').get(function() {
  return `${this.name.first} ${this.name.last}`;
});

const User = mongoose.model('ListingUser', userSchema);

export default User;
