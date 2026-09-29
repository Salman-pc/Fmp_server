import { User } from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        code: 'DUPLICATE_KEY_ERROR'
      });
    }

    const user = await User.create(req.body);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userObj }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    Object.assign(user, req.body);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: userObj }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
