const { Router } = require('express');
const { deleteAccount, deleteEmployeeAccount, getEmployee, logInEmployee, logout, registerEmployee, updateDetails, getEmployees } = require('../controllers/Employee.controller.js');
const { verifyJWT } = require('../middlewares/auth.middleware.js');

const router = Router();

router.route('/register').post(registerEmployee);
router.route('/login').post(logInEmployee);
router.route('/logout').post(verifyJWT, logout);
router.route('/getemployee').get(verifyJWT, getEmployee);
router.route('/delete').delete(verifyJWT, deleteAccount);
router.route('/deleteemployee').delete(deleteEmployeeAccount);
router.route('/update').patch(verifyJWT, updateDetails);
router.route("/getemployees").get(verifyJWT, getEmployees)

module.exports = router;
