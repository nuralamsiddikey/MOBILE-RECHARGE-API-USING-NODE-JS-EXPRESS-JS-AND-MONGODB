const router = require('express').Router()
const customer_model = require('../models/customer')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

router.post('/login',(req,res)=>{
       
    if (req.body.email) {
        customer_model.findOne({
            email: req.body.email
        }, (err, result) => {
            if (result) {
                const hashedPassword = CryptoJS.AES.decrypt(
                    result.password,
                    process.env.CUSTOMER_PASS_SEC
                );
                const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
                console.log(originalPassword)
                if (req.body.password == originalPassword) {
                    const accessToken = jwt.sign({
                        email: result.email,
                        customer_id: result._id,
                        device_id : result.device_id
                    },
                        process.env.JWT_CUSTOMER_SEC, {
                        expiresIn: "3d"
                    }
                    );




                    const {
                        password,
                        ...resluls
                    } = result._doc;

                    res.status(200).json({
                        message:"Login success",
                
                        accessToken,
                        error: false
                    });
                } else {
                    res.status(401).json({
                        message: "Wrong passwsord",
                        error: true
                    });
                }
            } else {
                res.status(500).json({
                    message: "Invalid user",
                    error: true
                });
            }
        });
    } else {
        res.status(403).json({
            message: "Invalid Email!",
        });
    }




})

module.exports = router
