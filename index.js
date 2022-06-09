const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv =require('dotenv')
var compression = require('compression')

dotenv.config()

var session = require('express-session')

app.use(session({
    secret:"my secret key",
    resave:true,
    saveUninitialized:true
}))



//IMPORTS
const superAdminRouter = require('./super_admin/api')
const adminRouter = require('./admin/api')
const rateRouter = require('./rate_module/api')
const cardServiceRouter = require('./admin/cardService')
const cardPackageRouter = require('./admin/cardPackage')
//const cardlistRouter = require('./card_list/api')
const paymentRouter = require('./admin/payment_report')
const customerTariffRouter = require('./admin/customer_tariff')
const customerRouter = require('./customer/customer_login')
const customerCreateRouter = require('./customer/customer_create')
const buyCardRouter = require('./customer/buyCard')
const mobileRechargeRouter = require('./customer/mobileRecharge')
const mobileBkasRouter = require('./customer/mobileBkas')
const findCustomerRouter = require('./customer/find_customer_by_id')


app.use(compression())
app.use(express.json())
app.use('/superAdmin',superAdminRouter)
app.use('/admin',adminRouter)
app.use('/rate',rateRouter)
app.use('/card',cardServiceRouter)
app.use('/card/package',cardPackageRouter)
//app.use('/cardlist',cardlistRouter)
app.use('/payment',paymentRouter)
app.use('/customerTariff',customerTariffRouter)
app.use('/customer',customerRouter)
app.use('/customerCreate',customerCreateRouter)
app.use('/buyCard',buyCardRouter)

app.use('/mobileRecharge',mobileRechargeRouter)
app.use('/mobileBkas',mobileBkasRouter)
app.use('/find_customer',findCustomerRouter)


// HOME ROUTES
app.get('/',(req,res)=>{
   res.send("This is routes")
})




//CATCH HANDLE

app.use((err,req,res,next)=>{
    if(err){
        res.status(400).send(err.message)
    }
})



//DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("DBConnection successfull!"))
.catch((err)=>console.log(err))




//SERVER LISTENING
app.listen( process.env.PORT ||5000 ,()=>{
    console.log('Backend server is running....')
})