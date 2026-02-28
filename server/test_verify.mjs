import fetch from "node-fetch";

const test = async () => {
  try {
    // 1. Get token
    const loginRes = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "aryan.kawale@example.com",
        password: "password123",
      }), // Dummy data, might fail
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Token:", token ? "Found" : "Missing", loginData.message);

    if (!token) {
      console.log("Trying register...");
      const regRes = await fetch("http://localhost:3000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Aryan",
          email: "aryan.kawale@example.com",
          password: "password123",
        }),
      });
      const regData = await regRes.json();
      console.log("Reg:", regData);
      if (regData.token) return await runPurchase(regData.token);
      return;
    }
    await runPurchase(token);
  } catch (e) {
    console.error(e);
  }
};

const runPurchase = async (token) => {
  const purchaseRes = await fetch("http://localhost:3000/api/credit/purchase", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify({ planId: "basic" }),
  });
  const orderData = await purchaseRes.json();
  console.log("OrderData:", orderData);

  if (orderData.success) {
    // 3. Mock verify
    const verifyRes = await fetch("http://localhost:3000/api/credit/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: "pay_test_" + Math.random(),
        razorpay_signature: "mock_signature",
      }),
    });
    const verifyData = await verifyRes.json();
    console.log("VerifyData:", verifyData);

    // Fetch User
    const userRes = await fetch("http://localhost:3000/api/user/data", {
      headers: { Authorization: token },
    });
    console.log("UserData:", await userRes.json());
  }
};

test();
