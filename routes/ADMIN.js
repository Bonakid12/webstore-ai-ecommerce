const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db')
const verifyToken = require('../middleware/adminVerify');


router.post('/update-admin',verifyToken, async (req, res) => {
    const {id,name,email,password,special_word}=req.body;
    if (!id||!name || !email || !password || !special_word) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
   try{
    const [existingUser]=await db.execute('SELECT name FROM admin WHERE user_id=?',[id]);
    if(existingUser.length===0){
        return res.status(400).json({message:'No such admin exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
        `UPDATE admin SET name=?,email=?,password=?,special_word=? WHERE user_id=?`,
        [name, email, hashedPassword, special_word,id]
    );
    res.status(200).json({ message: 'Admin updated successfully' });
   
   }
    catch(error){
     console.error('Error during registration:', error);
     res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.post('/delete-admin',verifyToken,async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'Admin ID is required' });
    }
    try {
        const [existingAdmin] = await db.execute(
            'SELECT name FROM admin WHERE user_id = ?',
            [id]
        );
        if (existingAdmin.length === 0) {
            return res.status(400).json({ message: 'Admin does not exist' });
        }
        const [result] = await db.execute('DELETE FROM admin WHERE user_id = ?', [id]);
        res.status(200).json({ message: 'Admin deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.post('/add-admin', verifyToken,async (req, res) => {
    const {name,email,password,special_word}=req.body;
    if (!name || !email || !password || !special_word) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
   try{
    const [existingUser]=await db.execute('SELECT name FROM admin WHERE email=?',[email]);
    if(existingUser.length>0){
        return res.status(400).json({message:'Admin already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
        `INSERT INTO admin (name,email,password,special_word) VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, special_word]
    );
    res.status(200).json({ message: 'Admin added successfully' });
    
   }
    catch(error){
     console.error('Error during registration:', error);
     res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.get('/get-all', verifyToken,async (req, res) => {
    try {
      const [admins] = await db.execute('SELECT * FROM admin');
      res.status(200).json(admins);
    } catch (error) {
      console.error('Error fetching Admins:', error);
      res.status(500).json({ message: 'Error fetching Admins' });
    }
  });
module.exports = router;