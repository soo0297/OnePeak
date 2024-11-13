import { useRef } from "react";
import Slider from "react-slick";

const useSlider = () => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
    draggable: true,
    swipe: true,
    centerMode: true,
    centerPadding: "5px",
    arrows: false
  };

  const sliderRef = useRef<Slider | null>(null);

  const goToSlide = (index: number) => {
    sliderRef.current?.slickGoTo(index);
  };

  return { sliderRef, goToSlide, settings };
};

export default useSlider;