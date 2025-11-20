import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Next slide"
  >
    <FiChevronRight size={24} />
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
    aria-label="Previous slide"
  >
    <FiChevronLeft size={24} />
  </button>
);

const Carousel = ({ slides = [] }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    dotsClass: 'slick-dots !bottom-6',
  };

  return (
    <div className="w-full" style={{ marginBottom: '0' }}>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <Slider {...settings}>
          {slides.map((slide, idx) => (
            <div key={idx}>
              <div
                className="relative h-[500px] md:h-[600px] bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="container mx-auto px-4 h-full flex items-center relative z-[1]">
                  <div className="max-w-2xl text-white animate-fade-in">
                    <div className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-bold mb-4 tracking-wide uppercase">
                      {slide.badge || 'New Arrivals'}
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/95 mb-8 leading-relaxed">
                      {slide.subtitle}
                    </p>
                    <div className="flex gap-4 flex-wrap">
                      {slide.primaryCta && (
                        <Link to={slide.primaryCta.href} className="btn btn-primary btn-lg">
                          <FiShoppingBag />
                          {slide.primaryCta.label}
                        </Link>
                      )}
                      {slide.secondaryCta && (
                        <Link to={slide.secondaryCta.href} className="btn btn-secondary btn-lg">
                          {slide.secondaryCta.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Carousel;


