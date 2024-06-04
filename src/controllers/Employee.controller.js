import asyncHandler from "../utilities/asyncHandler.js";
import Employee from '../models/Employee.model.js'
import ApiResponse from "../utilities/ApiResponse.js";
import ApiError from "../utilities/ApiError.js";
import { cookieOptions } from "../constant.js";


const generateAccessAndRefreshToken = async (userId) => {
    try {
      const employee = await Employee.findById(userId);
      const accessToken = employee.generateAccessToken();
      const refreshToken = employee.generateRefreshToken();
  
      employee.refreshToken = refreshToken; 
  
      await employee.save({ validateBeforeSave: false }); 
  
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens");
    }
  };

export const registerEmployee = asyncHandler(async (req, res) => {
    const { firstName, middleName, lastName, username, mobile,  email, introBio, role, joinedOn, password } = await req.body;
  
    if ([firstName, lastName, username, mobile, email, introBio, role, joinedOn, password].some((field) => field?.trim === ""))
      throw new ApiError(400, "All credientials are required");
  
    const existingEmployee = await Employee.findOne({
      $or: [{ username: username }, { email: email }],
    });
  
    if (existingEmployee)
      throw new ApiError(409, "Employee already exists with username and email");

    const registration = await Employee.create({
      username: username.toLowerCase(),
      firstName,
      middleName : middleName? middleName : "",
      lastName,
      username,
      mobile,
      email,
      introBio,
      role,
      joinedOn,
      password
    });
  
    const registeredEmployee = await Employee.findById(registration._id).select(
      "-password -refreshToken"
    );
  
    if (!registeredEmployee) 
      throw new ApiError(500, "Failed to register employee");
  
    return res
      .status(201)
      .json(new ApiResponse(200, registeredEmployee, "Employee registerd successfully"));
  });



  export const logInEmployee = asyncHandler(async (req, res) => {
    const { email, password } = await req.body;
  
    if (!email) 
     throw new ApiError(400, "Provide credientials for login");
  
    const employee = await Employee.findOne({ email: email }); 
  
    if (!employee) 
     throw new ApiError(404, "no employee found");
  
    const checkPassword = await employee.isPasswordCorrect(password);
  
    if (!checkPassword) 
     throw new ApiError(401, "password is incorrect");
  
    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      employee._id
    );
  
    const loggedInEmployee = await Employee.findById(employee._id).select(
      "-password -refreshToken"
    ); 
  
    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .cookie("accessToken", accessToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { employee: loggedInEmployee, accessToken, refreshToken },
          "User logged In successfully"
        )
      );
  });


  export const logout = asyncHandler( async(req,res) => {
    const _id = req.employee._id

    await Employee.findByIdAndUpdate(
      _id, 
      {
        $unset: {
          refreshToken: 1
        }
      },
      {new : true}
    ); 

    return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Employee logged out successfully"))
  }); 



  export const getEmployee = asyncHandler( async(req, res) => {
    const _id = req.employee._id; 

    if(!_id) 
      throw new ApiError(400, "Unauthorised User"); 

    const employee = await Employee.findById(_id).select("-password -refreshToken"); 
    if(!employee)
      throw new ApiError(404, "No employee found"); 

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        employee, 
        "employee details fetched successfully"
      )
    )
  }); 


  export const updateDetails = asyncHandler(async(req, res) => {
    const {firstName, middleName, lastName, mobile, introBio, role } = await req.body; 

    const _id = req.employee._id; 
    if(!_id)
        throw new ApiError(400, "Unauthorised employee"); 

    const updateFields = {};
    const fields = { firstName, middleName, lastName, mobile, introBio, role };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updateFields[key] = value;
    }

    if (Object.keys(updateFields).length === 0) {
      return new ApiError(400, "No feilds to update"); 
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true}
    ).select("-password -refreshToken"); 

    if(!updatedEmployee)
      throw new ApiError(500, "Failed to update the employee details");
    
    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          updatedEmployee
        },
        "User updated successfully"
      )
    )
  })


  export const deleteAccount = asyncHandler(async(req, res) => {
    const _id = await req.employee._id;
    
    if(!_id) 
      throw new ApiError(400, "Please provide employeeId"); 

    const deleteEmployeeRefrence = await Employee.findByIdAndDelete(_id); 
    if(!deleteEmployeeRefrence)
        throw new ApiError(500, "Failed to delete employee"); 

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Employee deleted successfully"
      )
    )
  }); 


  export const deleteEmployeeAccount = asyncHandler(async(req, res) => {
    const { employeeId } = await req.body;
    
    if(!employeeId) 
      throw new ApiError(400, "Please provide employeeId"); 

    const deleteEmployeeRefrence = await Employee.findByIdAndDelete(employeeId); 
    if(!deleteEmployeeRefrence)
        throw new ApiError(500, "Failed to delete employee"); 

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Employee deleted successfully"
      )
    )
  }); 

