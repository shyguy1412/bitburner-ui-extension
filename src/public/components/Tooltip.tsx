import '@/style/Tooltip.css';
import { Children, useEffect, useState } from 'react';
import React from 'react'

type Props = { children: JSX.Element[] | JSX.Element, show: boolean, parent: HTMLElement };

export function Tooltip({ children, show, parent }: Props) {
  children = [children].flat();

  const [attributes, setAttributes] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });

  useEffect(() => {
    function followMouse(ev: MouseEvent) {
      try {
        if (!show && attributes.show) setAttributes({
          x: attributes.x,
          y: attributes.y,
          show
        });
        if (!show) return;
        const bounds = parent.getBoundingClientRect();
        setAttributes({
          x: ev.clientX - bounds.x,
          y: ev.clientY - bounds.y,
          show
        })
      } catch (_) { }
    }

    document.addEventListener('mousemove', followMouse);
    return () => {
      document.removeEventListener('mousemove', followMouse);
    };
  });


  return <div style={{
    display: attributes.show ? 'block' : 'none',
    left: attributes.x + 10 + 'px',
    top: attributes.y + 'px'
  }}
    className="tooltip"
  >
    {...children}
  </div>
}