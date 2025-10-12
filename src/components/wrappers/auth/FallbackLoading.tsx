"use client";

import React from "react";

const FallbackLoading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#5C4099] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        
        {/* Loading text */}
        <div className="mt-4 text-[#525B75] font-nunito text-sm font-medium">
          {message}
        </div>
      </div>
    </div>
  );
};

export default FallbackLoading;