import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    mrp: {
      type: Number,
      default: function() { return this.price; },
    },
    unit: {
      type: String,
      default: 'piece', // e.g. 'piece', 'meter', 'kg', 'pack', 'liter', 'box'
    },
    quantityInStock: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock',
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    images: [{
      type: String,
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: [{
      type: String,
    }],
  },
  { timestamps: true }
);

// Auto compute stock status
productSchema.pre('save', function (next) {
  if (this.quantityInStock <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.quantityInStock <= this.lowStockThreshold) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Product', productSchema);
