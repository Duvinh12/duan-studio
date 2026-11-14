const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.Mixed, required: false },
    name: String,
    image: String,
    sku: String,
    color: String,
    size: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '' },
    googleId: { type: String, default: null },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    cart: { type: [cartItemSchema], default: [] },
    // Lưu mã OTP khôi phục mật khẩu và thời hạn hiệu lực (5 phút)
    resetOtp: { type: String, default: null },
    resetOtpExpire: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);