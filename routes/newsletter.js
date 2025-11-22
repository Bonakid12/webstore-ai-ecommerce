const express = require('express');
const router = express.Router();
const db = require('../db'); // Ensure you have a db.js file for database connection

// Handle newsletter subscription
router.post('/subscribe', async(req, res) => {
    const { email } = req.body;

    if (!email) {
        console.log('No email provided');
        return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Received email:', email);

   try{ // Check if the email already exists
    const[existingUser]=await db.execute('SELECT * FROM news_subscribers WHERE subscriber_email = ?', [email]);
    if(existingUser.length>0){
        return res.status(400).json({error:'Email already exists'});
    }
    // Insert email into the news_subscribers table
    const[result]=await db.execute('INSERT INTO news_subscribers (subscriber_email) VALUES (?)', [email]);
    res.json({message:'Subscription successful!'});
    }
    catch(error){
        console.error('Error during subscription:', error);
        res.status(500).json({message:'Internal Server Error'});
    }
}
);






module.exports = router;
