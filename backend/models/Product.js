const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  reservedStock: { type: Number, default: 0, min: 0 } // Phục vụ giữ kho tạm thời 15 phút
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  images: [{ type: String, required: true }],
  // Trường bắt buộc cho Anywear SDK
  anywearImage: { type: String, required: true },
  anywearCategory: { 
    type: String, 
    enum: ['top', 'bottom', 'dress', 'outerwear'], 
    required: true 
  },
  variants: [variantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);