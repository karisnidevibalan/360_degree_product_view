import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Carousel = ({ slides = [] }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    adaptiveHeight: true,
  };

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="card-body" style={{ padding: 0 }}>
          <Slider {...settings}>
            {slides.map((slide, idx) => (
              <div key={idx}>
                <div
                  style={{
                    position: 'relative',
                    height: '360px',
                    backgroundImage: `url(${slide.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%)',
                    }}
                  />
                  <div
                    className="container"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ maxWidth: '600px', color: 'white' }}>
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          background: 'rgba(212, 175, 55, 0.95)',
                          color: '#000',
                          fontWeight: 700,
                          marginBottom: '1rem',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {slide.badge || 'New Arrivals'}
                      </div>
                      <h2 style={{ fontSize: '2.25rem', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                        {slide.title}
                      </h2>
                      <p style={{ opacity: 0.95, marginBottom: '1.5rem' }}>{slide.subtitle}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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
    </div>
  );
};

export default Carousel;


