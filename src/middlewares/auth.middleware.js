const ApiError = require('../utilities/ApiError.js');
const asyncHandler = require('../utilities/asyncHandler.js');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee.model.js');

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken;

    if (!token) throw new ApiError(401, 'Unauthorised User');

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const employee = await Employee.findById(decodedToken._id).select('-password -refreshToken');

    if (!employee) throw new ApiError(500, 'No employee found');

    req.employee = employee;
    next();
});

module.exports = {
    verifyJWT,
};
