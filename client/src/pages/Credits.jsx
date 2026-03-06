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

const IconStar = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconCheckCircle = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Credits = () => {
  const { fetchUser, user } = useAppContext();
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

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl h-screen overflow-y-auto mx-auto px-4 sm:px-6 lg:px-8 py-12 page-enter">
      <div className="text-center mb-12 xl:mt-20">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Credit Plans
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Choose a plan that fits your needs
        </p>
        {user && (
          <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/10 px-5 py-2 rounded-full">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Current balance:
            </span>
            <span className="text-lg font-bold text-primary count-animate">
              {user.credits}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              credits
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan, i) => (
          <div
            key={plan._id}
            className={`stagger-item rounded-2xl p-7 min-w-[300px] max-w-[340px] flex flex-col transition-all hover:-translate-y-1.5 green-glow ${
              i === 1
                ? "bg-gradient-to-br from-primary/10 to-primary-dark/10 dark:from-primary/10 dark:to-primary-dark/10 border-2 border-primary/40 dark:border-primary/30 shadow-lg relative scale-[1.02]"
                : "bg-white dark:bg-sidebar-dark border border-gray-200 dark:border-white/8 shadow-sm"
            }`}
          >
            {i === 1 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary-dark text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                <IconStar /> Most Popular
              </span>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                {plan.name}
              </h3>
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark mb-1">
                ₹{plan.price}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                {plan.credits} credits included
              </p>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary mt-0.5 shrink-0">
                      <IconCheckCircle />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => buyCredits(plan._id, fetchUser)}
              className={`ripple mt-7 font-medium py-3 rounded-xl transition-all cursor-pointer active:scale-[0.98] text-sm ${
                i === 1
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:shadow-primary/25"
                  : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white dark:hover:bg-primary border border-gray-200 dark:border-white/10 hover:border-transparent"
              }`}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
