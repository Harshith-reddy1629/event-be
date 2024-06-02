const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_nJ2zmT29hMsPvc",
  key_secret: "YowtaJBvugCWrcjizp08PgsB",
});

var options = {
  amount: 99,
  currency: "INR",
  receipt: "Order_id",
};

instance.orders.create(options, function (err, order) {
  console.log(order);
});
