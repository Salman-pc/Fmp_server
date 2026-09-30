import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

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
