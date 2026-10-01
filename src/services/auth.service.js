import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { sendOtpEmail } from './email.service.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiresIn
  });
};

// Kept for backward compatibility
export const generateToken = generateAccessToken;

export const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    const error = new Error('Email is already registered.');
    error.statusCode = 409;
    error.code = 'DUPLICATE_KEY_ERROR';
    throw error;
  }

  const user = await User.create(userData);
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive
    },
    accessToken,
    refreshToken,
    token: accessToken
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated.');
    error.statusCode = 403;
    error.code = 'USER_INACTIVE';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.lastLoginAt = new Date();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    },
    accessToken,
    refreshToken,
    token: accessToken
  };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    const error = new Error('Refresh token is required.');
    error.statusCode = 401;
    error.code = 'REFRESH_TOKEN_REQUIRED';
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, config.refreshTokenSecret);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== incomingRefreshToken) {
    const error = new Error('Refresh token is revoked or user not found.');
    error.statusCode = 401;
    error.code = 'REVOKED_REFRESH_TOKEN';
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account has been deactivated.');
    error.statusCode = 403;
    error.code = 'USER_INACTIVE';
    throw error;
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken
  };
};

export const logoutUser = async (userId) => {
  if (userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('No user account found with that email address.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = resetCode;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  await user.save({ validateBeforeSave: false });

  // Dispatch OTP email via Nodemailer
  await sendOtpEmail(user.email, resetCode);

  return {
    message: 'Password reset OTP code sent to your email.',
    email: user.email,
    resetCode
  };
};

export const resetPassword = async (email, resetCode, newPassword) => {
  const user = await User.findOne({ email }).select('+password +resetPasswordToken +resetPasswordExpires');
  if (!user) {
    const error = new Error('No account found with that email address.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (
    !user.resetPasswordToken ||
    user.resetPasswordToken !== resetCode ||
    !user.resetPasswordExpires ||
    user.resetPasswordExpires < new Date()
  ) {
    const error = new Error('Invalid or expired reset code. Please request a new one.');
    error.statusCode = 400;
    error.code = 'INVALID_RESET_CODE';
    throw error;
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return {
    message: 'Password has been reset successfully. You can now log in with your new password.'
  };
};
