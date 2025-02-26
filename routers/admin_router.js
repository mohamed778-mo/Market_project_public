const router = require('express').Router();
const { adminAuth } = require('../middleware/auth');
const { setLanguage } = require('../middleware/setLanguage');     
const { admin_Register, admin_Login, add_product, get_product,
     get_all_products, editData, delete_product, delete_all_products ,get_all_users_emails, get_imports ,
  delete_imports,delete_all_imports
    } = require('../controllers/dashboard_control');
const Iupload = require("../middleware/uploads")

router.post('/admin_register', setLanguage, admin_Register);
router.post('/admin_login', setLanguage, admin_Login);
router.post('/add_product', adminAuth, setLanguage, Iupload.any(), add_product);

router.get('/get_product/:product_id', adminAuth, setLanguage, get_product);
router.get('/get_all_products', adminAuth, setLanguage, get_all_products);

router.patch('/edit_product/:product_id', adminAuth, setLanguage, Iupload.any(), editData);

router.delete('/delete_product/:product_id', adminAuth, setLanguage, delete_product);
router.delete('/delete_all_product', adminAuth, setLanguage, delete_all_products);

router.get('/get_all_users_emails', adminAuth, get_all_users_emails);

router.get('/get_imports', adminAuth, get_imports);

router.delete('/delete_import/:import_id', adminAuth, setLanguage, delete_imports);



router.delete('/delete_all_imports', adminAuth, setLanguage, delete_all_imports);


module.exports = router;
