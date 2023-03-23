import '@/style/Tooltip.css';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

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
        
        // if (!show) return;
        if (!ref.current) return;
        if (!parent.current) return;
        
        console.log(parent, ref, show);
        const bounds = parent.current.getBoundingClientRect();
        const selfBounds = ref.current.getBoundingClientRect();

        console.log('MOVE');


        setPos({
          x: Math.min(ev.clientX - bounds.x, bounds.right - selfBounds.width - 20),
          y: Math.min(ev.clientY - bounds.y, bounds.bottom - selfBounds.height - 20)
        })
      } catch (_) {
        console.log(_);
      }
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