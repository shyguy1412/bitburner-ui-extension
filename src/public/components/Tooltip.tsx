import '@/style/Tooltip.css';
import { Children, useEffect, useState } from 'react';
import React from 'react'

type Props = {
  children: JSX.Element[] | JSX.Element,
  show: boolean,
  parent: MutableRefObject<HTMLDivElement | undefined>,
  onMove: (listener: ((ev: MouseEvent) => void)) => void
};

export function Tooltip({ children, show, parent, onMove }: Props) {
  children = (() => {
    try {
      return [...(children as JSX.Element[])]
    } catch (_) {
      return [children as JSX.Element];
    }
  })()
  const ref = useRef<HTMLDivElement>();

  const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

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

    function hideTooltip(){
      setAttributes({
        x: attributes.x,
        y: attributes.y,
        show:false
      });
    }

    onMove((ev) => followMouse(ev));

    //   document.addEventListener('mousemove', followMouse);
    //   return () => {
    //     document.removeEventListener('mousemove', followMouse);
    //   };
  });


  return <div ref={ref as any} style={{
    opacity: show ? '1' : '0',
    left: pos.x + 10 + 'px',
    top: pos.y + 10 + 'px'
  }}
    className="tooltip"
  >
    {...children}
  </div>
}