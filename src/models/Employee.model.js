const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    tolowercase: true,
    trim: true,
  },
  middleName: {
    type: String,
    tolowercase: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    tolowercase: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    tolowercase: true,
    trim: true,
    index: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please fill a valid email address'],
    required: true,
    tolowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  introBio: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['developer', 'designer', 'manager'],
    required: true,
  },
  joinedOn: {
    type: Date,
    default: Date.now,
  },
  refreshToken: {
    type: String,
  },
}, { timestamps: true });

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  next();
});

employeeSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

employeeSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

employeeSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
