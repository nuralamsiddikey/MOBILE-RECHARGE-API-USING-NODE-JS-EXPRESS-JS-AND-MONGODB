const router = require('express').Router()
const CryptoJS = require('crypto-js')
const admin_model = require('../models/admin')
const { superAdminAcessToken, verifyToken} = require('../tokenVerify/index')
const module_model = require('../models/module')
const service_model = require('../models/service')
const country_model = require('../models/country')
const customer_model = require('../models/customer')

const jwt = require('jsonwebtoken')


//ADMIN CREATE
router.post('/create',superAdminAcessToken, (req, res) => {
    
        admin_model.findOne({
            email: req.body.email
        }, (err, result) => {
            if (!result) {
    
                const admin = new admin_model({
                    email: req.body.email,
                    password: CryptoJS.AES.encrypt(req.body.password, process.env.ADMIN_PASS),
                    phone: req.body.phone,
    
                })
    
                admin.save((err, adminData) => {
                    if (err) {
                        res.status(500).json(err)
                    } else {
                        const {
                            password,
                            ...result
                        } = adminData._doc
                        res.status(200).json({
                            message: "Successfully created admin!",
                            result,
                            error: false
                        })
                    }
                })
    
    
    
    
    
    
            } else {
                res.status(406).json({
                    message: "Admin already exist plz try another email",
                    error: true
                })
            }
        })
   
})


// ADMIN LOGIN
router.post("/login", (req, res) => {
   
    if (req.body.email) {
        admin_model.findOne({
            email: req.body.email
        }, (err, result) => {
            if (result) {
                const hashedPassword = CryptoJS.AES.decrypt(
                    result.password,
                    process.env.ADMIN_PASS
                );
                const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
               
                if (req.body.password == originalPassword) {
                    const accessToken = jwt.sign({
                        email: result.email,
                        admin_id: result._id,
                    },
                        process.env.JWT_SEC, {
                        expiresIn: "3d"
                    }
                    );


                  
                    


                    const {
                        password,
                        ...results
                    } = result._doc;

                    res.status(200).json({
                        message:"Login success",
                        results,
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





//CREATE MODULE
router.post('/createmodule', verifyToken,  (req, res) => {
  
   //  const isCountry = country_model.findOne({_id: req.body.country_id})
 
    service_model.findOne({
        _id: req.body.service_id
    }, (err, result) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (result == null) {
                res.status(404).json({
                    message: "Service is not available",
                    error: true
                })

            } else if (result != null) {
                country_model.findOne({
                    _id: req.body.country_id
                }, (error, countryData) => {
                    if (error) {
                        res.status(500).json()
                    } else {


                        if (countryData == null) {
                            res.status(404).json({
                                message: "This country is not available",
                                error: true
                            })
                        } else {

                            const module = new module_model({
                                name: req.body.name,
                                service_id: req.body.service_id,
                                country_id: req.body.country_id,
                                flag: req.body.flag,
                                prefix: req.body.prefix,
                                admin_id: req.admin.admin_id,
                            })

                            module.save((err, result) => {
                                if (err) {
                                    res.status(200).json(err)
                                } else {
                                    res.status(200).json({
                                        message: "Successfully created module!",
                                        result,
                                        error: false
                                    })
                                }
                            })


                        }



                    }
                })


            }
        }

    })


})






//FIND ALL MODULE
router.get('/findmodule',verifyToken, (req,res,next)=>{
  
  
    module_model.find({admin_id: req.admin.admin_id},(err,allmoduleData)=>{
        if(err){
            res.status(500).json(err)
        }else{

         if(allmoduleData != null){
            let page = parseInt(req.query.page)
            let limit = parseInt(req.query.limit)
    
       if (!page) {
           page = 1;
       }
       if (!limit) {
           limit = 50;
       }
    
       const startIndex = (page - 1) * limit;
       const endIndex = page * limit;
       const result =  allmoduleData.slice(startIndex, endIndex);
       const len = result.length   
      
         res.status(200).json({
             message: "Showing results",
             count: len,
             result,
             error: false
         })

         }else{
             res.status(404).json({
                 message:"Couldn't find any module"
             })
         }


        }
    })
 
   
})





module.exports = router