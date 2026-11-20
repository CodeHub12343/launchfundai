'use client';
import { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Wrap = styled.div`
  opacity: 0;
  ${({ $visible, $delay }) =>
    $visible &&
    css`
      animation: ${fadeUp} 700ms cubic-bezier(.22, .61, .36, 1) ${$delay}ms forwards;
    `}
  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
    transform: none;
  }
`;

export default function Reveal({ children, delay = 0, as, className, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Wrap ref={ref} as={as} className={className} style={style} $visible={visible} $delay={delay}>
      {children}
    </Wrap>
  );
}
