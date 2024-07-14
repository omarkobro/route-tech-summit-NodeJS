import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../DB/models/user.model.js';

// User registration
export let register = async (req, res, next) => {
    let { name, email, password } = req.body;

    // Check if the email already exists
    let isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        return next(new Error("Email Already Exists", { cause: 409 }));
    }

    // Hash the password
    let hashedPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUNDS);

    // Create a new user
    let newUser = await User.create({ name, email, password: hashedPassword });
    if (!newUser) {
        return next(new Error("Creation Failed", { cause: 500 }));
    }

    // Return success message and the new user
    return res.status(201).json({
        message: 'User created successfully',
        newUser
    });
};

// User login
export let login = async (req, res, next) => {
    let { email, password } = req.body;

    // Check if the email exists
    let isEmailExists = await User.findOne({ email });
    if (!isEmailExists) {
        return next(new Error("Invalid login credentials", { cause: 401 }));
    }

    // Check if the password is correct
    let isPasswordCorrect = bcryptjs.compareSync(password, isEmailExists.password);
    if (!isPasswordCorrect) {
        return next(new Error("Invalid login credentials", { cause: 401 }));
    }

    // Create and return a JWT token for authentication
    let token = jwt.sign(
        { id: isEmailExists._id, userEmail: isEmailExists.email },
        process.env.LOGIN_SIGNATURE,
        {
            expiresIn: '48h'
        }
    );

    res.status(200).json({ message: 'User logged in successfully', token });
};

// Get user details
export let getUser = async (req, res, next) => {
    let user = req.authUser;
    res.status(200).json({ user });
};
