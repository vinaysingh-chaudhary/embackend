import { Router } from "express";
import { deleteAccount, deleteEmployeeAccount, getEmployee, logInEmployee, logout, registerEmployee, updateDetails } from "../controllers/Employee.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router(); 

router.route("/register").post(registerEmployee); 
router.route("/login").post(logInEmployee); 
router.route("/logout").post(verifyJWT ,logout)
router.route("/getemployee").get(verifyJWT, getEmployee)
router.route("/delete").delete(verifyJWT, deleteAccount); 
router.route("/deleteemployee").delete(deleteEmployeeAccount)
router.route("/update").patch(verifyJWT, updateDetails); 

export default router;  
