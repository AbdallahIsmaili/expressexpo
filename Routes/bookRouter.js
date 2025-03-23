const {createBook,updateBook} = require('../Controllers/bookController');

const router=require('express').Router();

router.post('/create',createBook);
router.put('/update/:id',updateBook);
module.exports=router;