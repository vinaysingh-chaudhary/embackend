const { Router } = require('express');
const { deleteAccount, deleteEmployeeAccount, getEmployee, logInEmployee, logout, registerEmployee, updateDetails } = require('../controllers/Employee.controller.js');
const { verifyJWT } = require('../middlewares/auth.middleware.js');

const router = Router();

router.route('/register').post(registerEmployee);
router.route('/login').post(logInEmployee);
router.route('/logout').post(verifyJWT, logout);
router.route('/getemployee').get(verifyJWT, getEmployee);
router.route('/delete').delete(verifyJWT, deleteAccount);
router.route('/deleteemployee').delete(deleteEmployeeAccount);
router.route('/update').patch(verifyJWT, updateDetails);

module.exports = router;
