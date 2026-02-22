import React, { useEffect, useState } from "react";
import { dummyPublishedImages } from "../assets/assets";
import Loading from "./Loading";

const Community = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    setImages(dummyPublishedImages);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 pt-12 xl:px-12 2xl:px-[10%] w-full mx-auto h-full overflow-y-scroll">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-purple-100">
        Community Images
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {images.length > 0 ? (
          images.map((item, index) => (
            <a
              key={index}
              href={item.imageUrl}
              target="_blank"
              className="relative group block rounded-lg overflow-hidden border border-gray-200 dark:border-purple-700 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-40 md:h-52 2xl:h-64 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
              />
              <p className="absolute bottom-0 right-0 text-xs bg-black/50 backdrop-blur text-white px-4 py-1 rounded-tl-xl opacity-0 group-hover:opacity-100 transition duration-300">
                Created by {item.userName}
              </p>
            </a>
          ))
        ) : (
          <p className="col-span-full">No images Available</p>
        )}
      </div>
    </div>
  );
};

export default Community;
