"use client";

import SpinnerButton from "@/components/ui/SpinnerButton";
import { useMatching } from "@/hooks/useMatching";
import { useScreenSizeStore } from "@/shared/StoreProvider";
import { useEffect } from "react";

const Matching = () => {
  console.log("Matching");
  const { isMatching, setupMatchingChannel, cleanUp } = useMatching();
  const isLargeScreen = useScreenSizeStore((state) => state.isLargeScreen);

  const paddingRight = isLargeScreen ? "12px" : "16px";
  console.log("isMatching: ", isMatching);
  useEffect(() => {
    if (isMatching) {
      setupMatchingChannel();
      console.log("매칭중");
    } else {
      cleanUp();
    }
  }, [isMatching, setupMatchingChannel, cleanUp]);

  if (isMatching) {
    return (
      // <div className="w-full min-w-[314px] max-w-[1024px] mx-auto">
      <div
        className="
          fixed 
          bottom-0 
          right-4
          pb-safe-offset-24
          md:top-[80px]
          md:right-3
          z-[300]"
        style={{ right: "calc((100% - clamp(314px, 100%, 1024px)) / 2)", paddingRight: paddingRight }}
      >
        <SpinnerButton />
      </div>
      // </div>
    );
  } else {
    return null;
  }
};

export default Matching;
