import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PromoCarousel.module.css';

/**
 * PromoCarousel - Displays promotional banners.
 * Uses images from /public as backgrounds with functional CTA buttons.
 */
export default function PromoCarousel() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  const promos = [
    {
      id: 1,
      image: '/Bônus de boas-vindas com diversão.png',
      alt: 'Bônus de boas-vindas',
      link: '#',
      cta: 'PEGAR BÔNUS'
    },
    {
      id: 2,
      image: '/Lucro máximo nas apostas esportivas.png',
      alt: 'Lucro máximo',
      link: '#',
      cta: 'APROVEITAR AGORA'
    },
    {
      id: 3,
      image: '/Saques e depósitos com PIX.png',
      alt: 'Depósito via PIX',
      link: '#',
      cta: 'DEPOSITAR'
    }
  ];

  const scrollTo = useCallback((index) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % promos.length;
    scrollTo(nextIndex);
  }, [activeIndex, promos.length, scrollTo]);

  const handlePrev = useCallback(() => {
    const prevIndex = (activeIndex - 1 + promos.length) % promos.length;
    scrollTo(prevIndex);
  }, [activeIndex, promos.length, scrollTo]);

  // Auto-scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [handleNext]);

  // Handle manual scroll to update pagination dots
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== activeIndex && index >= 0 && index < promos.length) {
      setActiveIndex(index);
    }
  };

  return (
    <div className={styles.carouselWrapper}>
      {/* Navigation Buttons for PC */}
      <button 
        className={`${styles.navBtn} ${styles.prevBtn}`} 
        onClick={handlePrev}
        aria-label="Anterior"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <button 
        className={`${styles.navBtn} ${styles.nextBtn}`} 
        onClick={handleNext}
        aria-label="Próximo"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>

      <div 
        className={styles.carouselContainer} 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {promos.map((promo) => (
          <div 
            key={promo.id} 
            className={styles.promoCard}
            style={{ backgroundImage: `url("${promo.image}")` }}
            onClick={() => { if (promo.link !== '#') navigate(promo.link); }}
          >
            <div className={styles.overlay} />
            <div className={styles.promoContent}>
               <button className={styles.promoBtn}>{promo.cta}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Indicators */}
      <div className={styles.pagination}>
        {promos.map((_, i) => (
          <div 
            key={i} 
            className={`${styles.dot} ${i === activeIndex ? styles.activeDot : ''}`}
            onClick={() => scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
