const asyncHandler = require('../utilities/asyncHandler.js');
const Employee = require('../models/Employee.model.js');
const ApiResponse = require('../utilities/ApiResponse.js');
const ApiError = require('../utilities/ApiError.js');

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const employee = await Employee.findById(userId);
        const accessToken = employee.generateAccessToken();
        const refreshToken = employee.generateRefreshToken();

        employee.refreshToken = refreshToken;

        await employee.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating tokens');
    }
};

const registerEmployee = asyncHandler(async (req, res) => {
    const { firstName, middleName, lastName, username, mobile, email, introBio, role, joinedOn, password } = req.body;

    if ([firstName, lastName, username, mobile, email, introBio, role, password].some((field) => field?.trim === '')) {
        throw new ApiError(400, 'All credentials are required');
    }

    const existingEmployee = await Employee.findOne({
        $or: [{ username: username }, { email: email }],
    });

    if (existingEmployee) {
        throw new ApiError(409, 'Employee already exists with username and email');
    }

    const registration = await Employee.create({
        username: username.toLowerCase(),
        firstName,
        middleName: middleName ? middleName : '',
        lastName,
        username,
        mobile,
        email,
        introBio,
        role,
        joinedOn,
        password,
    });

    const registeredEmployee = await Employee.findById(registration._id).select('-password -refreshToken');

    if (!registeredEmployee) {
        throw new ApiError(500, 'Failed to register employee');
    }

    return res.status(200).json(new ApiResponse(200, registeredEmployee, 'Employee registered successfully'));
});





const logInEmployee = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, 'Provide credentials for login');
    }

    const employee = await Employee.findOne({ email: email });

    if (!employee) {
        throw new ApiError(404, 'No employee found');
    }

    const checkPassword = await employee.isPasswordCorrect(password);

    if (!checkPassword) {
        throw new ApiError(401, 'Password is incorrect');
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(employee._id);

    const loggedInEmployee = await Employee.findById(employee._id).select('-password -refreshToken');

    return res
        .status(200)
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, 
            sameSite: 'None'
            })
            
        .cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, 
            sameSite: 'None'
            })
        .json(new ApiResponse(200, { employee: loggedInEmployee, accessToken, refreshToken }, 'User logged in successfully'));
});





const logout = asyncHandler(async (req, res) => {
    const _id = req.employee._id;

    await Employee.findByIdAndUpdate(_id, {
        $unset: {
            refreshToken: 1,
        },
    }, { new: true });

    return res.status(200)
        .clearCookie('refreshToken', {
            httpOnly: true,
            secure: true, 
            sameSite: 'None'
            })
        .clearCookie('accessToken', {
            httpOnly: true,
            secure: true, 
            sameSite: 'None'
            })
        .json(new ApiResponse(200, {}, 'Employee logged out successfully'));
});





const getEmployee = asyncHandler(async (req, res) => {
    const _id = req.employee._id;

    if (!_id) {
        throw new ApiError(400, 'Unauthorised User');
    }

    const employee = await Employee.findById(_id).select('-password -refreshToken');

    if (!employee) {
        throw new ApiError(404, 'No employee found');
    }

    return res.status(200).json(new ApiResponse(200, employee, 'Employee details fetched successfully'));
});


const getEmployees = asyncHandler(async(req, res) => {
    const _id = req.employee._id;
 
    if (!_id) {
        throw new ApiError(400, 'Unauthorised User');
    }

    const isAdmin = await Employee.findById(_id).select("-password -refreshToken"); 
    if(isAdmin.isAdmin !== true){
        throw new ApiError(500, "Employee have no access to this endpoint"); 
    }

    const employees = await Employee.find({}); 
    if(!employees){
        throw new ApiError(500, "Failed to fetch employees"); 
    }

    return res.status(200).json(new ApiResponse(200, employees, "Employees fetched successfully")); 
})




const updateDetails = asyncHandler(async (req, res) => {
    const { firstName, middleName, lastName, mobile, introBio, role } = req.body;

    const _id = req.employee._id;

    if (!_id) {
        throw new ApiError(400, 'Unauthorised employee');
    }

    const updateFields = {};
    const fields = { firstName, middleName, lastName, mobile, introBio, role };

    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) updateFields[key] = value;
    }

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, 'No fields to update');
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(_id, { $set: updateFields }, { new: true }).select('-password -refreshToken');

    if (!updatedEmployee) {
        throw new ApiError(500, 'Failed to update the employee details');
    }

    return res.status(200).json(new ApiResponse(200, { updatedEmployee }, 'User updated successfully'));
});



const deleteAccount = asyncHandler(async (req, res) => {
    const _id = req.employee._id;

    if (!_id) {
        throw new ApiError(400, 'Please provide employeeId');
    }

    const deleteEmployeeReference = await Employee.findByIdAndDelete(_id);

    if (!deleteEmployeeReference) {
        throw new ApiError(500, 'Failed to delete employee');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Employee deleted successfully'));
});




const deleteEmployeeAccount = asyncHandler(async (req, res) => {
    const { employeeId } = req.query;

    if (!employeeId) {
        throw new ApiError(400, 'Please provide employeeId');
    }

    const deleteEmployeeReference = await Employee.findByIdAndDelete(employeeId);

    if (!deleteEmployeeReference) {
        throw new ApiError(500, 'Failed to delete employee');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Employee deleted successfully'));
});



module.exports = {
    registerEmployee,
    logInEmployee,
    logout,
    getEmployee,
    updateDetails,
    deleteAccount,
    deleteEmployeeAccount,
    getEmployees
};
