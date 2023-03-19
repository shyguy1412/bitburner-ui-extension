import '@/style/Tooltip.css';
import { Children, useEffect, useState } from 'react';

type Props = { children: JSX.Element[] | JSX.Element, show: boolean, parent: HTMLElement };

export function Tooltip({ children, show, parent }: Props) {
  children = [children].flat();

  const [pos, setPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    function followMouse(ev: MouseEvent) {
      const bounds = parent.getBoundingClientRect();
      setPos({
        x: ev.clientX - bounds.x,
        y: ev.clientY - bounds.y,
      })
    }

    document.addEventListener('mousemove', followMouse);
    return () => document.removeEventListener('mousemove', followMouse);
  });


  return <div style={{
    display: show ? 'block' : 'none',
    left: pos.x + 10 + 'px',
    top: pos.y + 'px'
  }}
    className="tooltip"
  >
    {...children}
  </div>
}