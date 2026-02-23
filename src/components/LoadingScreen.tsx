"use client";

import { FidgetSpinner } from "react-loader-spinner";

export const LoadingScreenSection = () => {
  return (
    <div className="z-[100] flex w-full h-full justify-center items-center absolute inset-0 bg-opacity-50 bg-black">
      <FidgetSpinner height="80" width="80" visible={true} />
    </div>
  );
};

export const LoadingScreenFullScreen = () => {
  return (
    <div className="z-[200] flex w-[100svw] h-[100svh] justify-center items-center">
      <FidgetSpinner height="80" width="80" visible={true} />
    </div>
  );
};

LoadingScreenFullScreen;
