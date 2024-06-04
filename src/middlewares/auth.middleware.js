import ApiError from "../utilities/ApiError.js";
import asyncHandler from "../utilities/asyncHandler.js";
import jwt from 'jsonwebtoken'
import Employee from "../models/Employee.model.js";


export const verifyJWT = asyncHandler (async(req, res, next) => {
    const token = req.cookies?.accessToken; 

    if(!token) throw new ApiError(401, "Unauthorised User"); 

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 

    const employee = await Employee.findById(decodedToken._id).select("-password -refreshToken"); 

    if(!employee) new ApiError(500, "No employee found"); 
 
    req.employee = employee;
    next(); 
})