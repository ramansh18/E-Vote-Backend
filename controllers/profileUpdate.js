const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust the path to your User model

// Update Profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, gender, age } = req.body;

        // Ensure that the email is unique (except for the current user)
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
            return res.status(400).json({ msg: 'Email already in use' });
        }

        // Update user details
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { name, email, phone, gender, age }, 
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check if the current password is correct
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        // Hash the new password and update it
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    updateProfile,
    changePassword,
};
