import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, credit_limit } = req.body;
        
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'REF',
            credit_limit: credit_limit || 0
        });

        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, password, role, credit_limit } = req.body;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.credit_limit = credit_limit !== undefined ? credit_limit : user.credit_limit;

        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Don't allow deleting the last admin
        if (user.role === 'ADMIN') {
            const adminCount = await User.count({ where: { role: 'ADMIN' } });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last administrator' });
            }
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, password } = req.body;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        user.name = name || user.name;
        // Don't allow changing email/role from here for safety
        
        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
