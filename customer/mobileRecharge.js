const router = require("express").Router();
const { verifyToken, customerAcessToken } = require("../tokenVerify");
const customer_model = require("../models/customer");
const module_model = require("../models/module");
const customer_tariff_model = require("../models/customerTariff");
const MobileRechargeHistory = require("../models/mobileRechargeHistory");
const { verify } = require("jsonwebtoken");
const res = require("express/lib/response");

router.put("/recharge", customerAcessToken, async (req, res, next) => {
  try {
    const Loggedcustomer = await customer_model.findOne({
      _id: req.customer.customer_id,
    });
    const admin_id = Loggedcustomer.admin_id;
    const device_id = Loggedcustomer.device_id;

    const module = await module_model.findOne({
      $and: [{ _id: req.body.module_id }, { admin_id: admin_id }],
    });

    if (module != null) {
      let service_id = module.service_id;

      const customer = await customer_tariff_model.findOne({
        customer_id: req.customer.customer_id,
      });
      const customer_tariff = customer.tariff;

      const customer_tariff_len = customer_tariff.length;

      for (let i = 0; i < customer_tariff_len; i = i + 1) {
        if (customer.tariff[i].service_id == service_id) {
          const amount = req.body.amount;
          const charge = customer.tariff[i].charge;
          const commission = customer.tariff[i].commission;
          const cost = customer.tariff[i].cost;

          const all_service_permission = await customer_model.findOne(
            { _id: req.customer.customer_id },
            { service_permission: 1, _id: 0 }
          );
          const all_service_permission_id =
            all_service_permission.service_permission;

          for (let a = 0; a < all_service_permission_id.length; a = a + 1) {
            for (let b = 0; b < all_service_permission_id.length; b = b + 1) {
              if (
                all_service_permission_id[a] == all_service_permission_id[b]
              ) {
                const customer_data = await customer_model.findOne({
                  _id: req.customer.customer_id,
                });

                let customer_balance = Loggedcustomer.balance;

                if (commission) {
                  const total_commission = (amount * commission) / 100;
                  const total_charge = (amount * charge) / 100;

                  const total_cost = amount * cost;

                  const final_cost =
                    total_charge + total_cost - total_commission;

                  if (customer_balance >= final_cost) {
                    let customer_current_balance =
                      customer_balance - final_cost;
                    const newCustomer_data = {
                      balance: customer_current_balance,
                    };

                    await customer_model.findOneAndUpdate(
                      { _id: req.customer.customer_id },
                      newCustomer_data
                    );
                    const a = await customer_model.findOne({
                      _id: customer.customer_id,
                    });
                    const adminId = a.admin_id;

                    const new_mobile_recharge_history =
                      new MobileRechargeHistory({
                        customer_id: req.customer.customer_id,
                        admin_id: adminId,
                        module_id: req.body.module_id,
                        service_id: service_id,
                        request_id: Math.floor(100000 + Math.random() * 900000),
                        device_id: device_id,
                        previous_balance: customer_balance,
                        amount: req.body.amount,
                        current_balance: customer_current_balance,
                        cost: total_cost,
                        commission: total_commission,
                        charge: total_charge,
                        phone_number: req.body.phone_number,
                        type: req.body.type,
                        admin_id: adminId,
                      });

                    await new_mobile_recharge_history.save();

                    res.status(200).json({
                      message: "Mobile recharge succesful",

                      error: false,
                    });
                  } else {
                    res.status(403).json({
                      message: "insufficient balance!",
                      error: false,
                    });
                  }
                } else {
                  const total_cost = amount * cost;
                  const total_charge = (amount * charge) / 100;
                  const final_cost = total_charge + total_cost;
                  const total_commission = 0;

                  if (customer_balance >= final_cost) {
                    const newCustomer_data = {
                      balance: customer_balance - amount,
                    };

                    const updated_customer_data =
                      await customer_model.findOneAndUpdate(
                        { _id: req.customer.customer_id },
                        newCustomer_data
                      );
                    const a = await customer_model.findOne({
                      _id: req.customer.customer_id,
                    });
                    const adminId = a.admin_id;
                    const new_mobile_recharge_history =
                      new MobileRechargeHistory({
                        customer_id: req.customer.customer_id,
                        admin_id: adminId,
                        module_id: req.body.module_id,
                        service_id: service_id,
                        request_id: Math.floor(100000 + Math.random() * 900000),
                        device_id: device_id,
                        previous_balance: customer_balance,
                        amount: req.body.amount,
                        current_balance: customer_balance - amount,
                        cost: total_cost,
                        commission: total_commission,
                        phone_number: req.body.phone_number,
                        admin_id: adminId,
                      });

                    const result = await new_mobile_recharge_history.save();

                    res.status(200).json({
                      message: "Mobile recharge succesful",
                      result,
                      error: false,
                    });
                  } else {
                    res.status(403).json({
                      message: "insufficient balance!",
                      error: false,
                    });
                  }
                }
              } else {
                res.send("service permission is not found");
              }
            }
          }
        } else {
          if (i == customer_tariff_len - 1) {
            res.status(404).json({
              message: "Customer tariff is not available",
              error: false,
            });
          }
        }
      }
    } else {
      res.status(404).json({
        message: "Module is not available!",
        error: true,
      });
    }
  } catch (err) {
    next(err);
  }
});

//MOBILE RECHARGE HISTORY SEARCH BY ADMIN MULTIPLE CONDITION
router.get("/recharge/history/filter", verifyToken, async (req, res, next) => {
  try {
    const admin_id = req.admin.admin_id;
    const {
      customer_id,
      module_id,
      service_id,
      request_id,

      phone_number,
    } = req.query;

    const query = {
      admin_id,
    };
    if (customer_id) {
      query.customer_id = customer_id;
    }
    if (module_id) {
      query.module_id = module_id;
    }
    if (service_id) {
      query.service_id = service_id;
    }
    if (request_id) {
      query.request_id = request_id;
    }

    if (phone_number) {
      if (!query.$or) {
        query.$or = [];
      }
      query.$or.push({
        phone_number: { $regex: phone_number, $options: "$i" },
      });
    }
    const mobileRechargeHistory = await MobileRechargeHistory.find(query);

    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 30;
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const result = mobileRechargeHistory.slice(startIndex, endIndex);
    const len = result.length;

    res.send({
      count: result.length,
      result,
      error: false,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
});

//MOBILE RECHARGE HISTORY SEARCH BY CUSTOMER MULTIPLE CONDITION
router.get(
  "/mobileRechargeHistoeryByCustomer",
  customerAcessToken,
  async (req, res, next) => {
    try {
      let customerId = req.customer.customer_id;

      const {
        module_id,
        service_id,
        request_id,

        phone_number,
      } = req.query;

      const query = {
        customer_id: customerId,
      };

      if (module_id) {
        query.module_id = module_id;
      }
      if (service_id) {
        query.service_id = service_id;
      }
      if (request_id) {
        query.request_id = request_id;
      }

      if (phone_number) {
        if (!query.$or) {
          query.$or = [];
        }
        query.$or.push({
          phone_number: { $regex: phone_number, $options: "$i" },
        });
      }
      const mobileRechargeHistory = await MobileRechargeHistory.find(query);

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);

      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 30;
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const result = mobileRechargeHistory.slice(startIndex, endIndex);
      const len = result.length;

      res.send({
        count: result.length,
        result,
        error: false,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

module.exports = router;
