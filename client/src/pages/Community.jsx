import React, { useEffect, useState } from "react";

import Loading from "./Loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const Community = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios } = useAppContext();

  const fetchImages = async () => {
    try {
      const { data } = await axios.get("/api/user/published-images");
      if (data.success) {
        setImages(data.images);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 pt-12 xl:px-12 2xl:px-[10%] w-full mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Community{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark">
            Images
          </span>
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Explore AI-generated art from the community
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.length > 0 ? (
          images.map((item, index) => (
            <a
              key={index}
              href={item.imageUrl}
              target="_blank"
              className="relative group block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border border-gray-200 dark:border-white/5 hover:border-primary/30"
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-40 md:h-52 2xl:h-64 object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          ))
        ) : (
          <p className="col-span-full text-gray-400 dark:text-gray-500 text-center py-12">
            No images available yet
          </p>
        )}
      </div>
    </div>
  );
};

export default Community;
