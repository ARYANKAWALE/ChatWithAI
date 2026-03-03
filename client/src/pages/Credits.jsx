import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import Loading from "./Loading";
import toast from "react-hot-toast";

const buyCredits = async (planId, fetchUser) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to purchase credits. ⚠️");
    return;
  }

  try {
    // backend se order create
    const res = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/credit/purchase`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ planId }),
      },
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.message || "Failed to initiate purchase ❌");
      return;
    }

    // Razorpay popup options
    const options = {
      key: "rzp_test_SKhwF0mpn95N5H",
      amount: data.order.amount,
      currency: "INR",
      name: "AI Agent",
      description: "Buy Credits",
      order_id: data.order.id,

      handler: async function (response) {
        try {
          const verifyRes = await fetch(
            `${import.meta.env.VITE_SERVER_URL}/api/credit/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify(response),
            },
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Payment Successful 🎉");
            fetchUser();
          } else {
            alert(verifyData.message || "Payment verification failed ❌");
          }
        } catch (error) {
          console.error(error);
          alert("Payment verification error ❌");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error(error);
    alert("An error occurred during purchase ❌");
  }
};

const Credits = () => {
  const { fetchUser } = useAppContext();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const { axios, token } = useAppContext();

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get("/api/credit/plan", {
        headers: {
          Authorization: token,
        },
      });
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error(data.message || "Failed to fetch plans.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post(
        "/api/credit/purchase",
        {
          planId,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      if (data.success) {
        toast.success(data.message);
        fetchUser();
      } else {
        toast.error(data.message || "Failed to purchase plan.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl h-screen overflow-y-scroll mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-semibold text-center mb-10 xl:mt-30 text-gray-800 dark:text-white">
        Credit Plans
      </h2>
      <div className="flex flex-wrap justify-center gap-8">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className={`border border-gray-200 dark:border-[#d0b611]/30 rounded-lg shadow hover:shadow-lg transition-shadow p-6 min-w-[300px] flex flex-col ${plan._id === "pro" ? "bg-[#fdf6e3] dark:bg-[#1e1a02]" : "bg-white dark:bg-transparent"}`}
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <p className="text-2xl font-bold text-[#d0b611] dark:text-[#e8cc30] mb-4">
                ₹{plan.price}
                <span className="text-base font-normal text-gray-600 dark:text-[#d0b611]/70">
                  {""}/ {plan.credits} credits
                </span>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => buyCredits(plan._id, fetchUser)}
              className="mt-6 bg-[#d0b611] hover:bg-[#b89a0d] active:bg-[#9a8209] text-white font-medium py-2 rounded transition-colors cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
