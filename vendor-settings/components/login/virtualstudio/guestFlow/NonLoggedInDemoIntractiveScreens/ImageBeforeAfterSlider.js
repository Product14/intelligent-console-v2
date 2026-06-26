/**
 * @format
 */
import { useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage
} from "react-compare-slider";

function ImageBeforeAfterSlider({ beforeImg, afterImg, sliderClass }) {
  const [viewToolTips, setViewTooltips] = useState(true);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const handleChangePosition = (percent) => {
    const noOfPercent = Math.floor(percent)
    if (viewToolTips && noOfPercent === 50) {
      setViewTooltips(false)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
      <ReactCompareSlider
        className={`overflow-hidden absolute z-10`}
        onPositionChange={(e) => handleChangePosition(e)}
        itemOne={
          <>
          {!isImageLoaded &&
            <div className="rounded-lg absolute inset-0 h-full object-cover aspect-video shimmer min-h-[23vh] sm:min-h-[20vh] w-full flex items-center justify-center border text-gray-500 text-xl"></div>
      }
          <ReactCompareSliderImage
            src={beforeImg}
            onLoad={handleImageLoad}
            srcSet={beforeImg}
            alt="before_image "
            className="aspect-video object-center rounded-lg sm:rounded-none sm:rounded-t-lg bg-transparent before-image relative"

          />
          </>
        }
        itemTwo={
          <>
          {!isImageLoaded &&
            <div className="rounded-lg absolute inset-0 h-full object-cover aspect-video shimmer min-h-[23vh] sm:min-h-[20vh] w-full flex items-center justify-center border text-gray-500 text-xl"></div>
      }
          <ReactCompareSliderImage
            src={afterImg}
            srcSet={afterImg}
            onLoad={handleImageLoad}
            alt="after_image"
            className="aspect-video object-center rounded-lg sm:rounded-none sm:rounded-t-lg bg-transparent after-image relative"
          />
          </>
        }
      />
  );
}

export default ImageBeforeAfterSlider;
