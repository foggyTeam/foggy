import styles from '@/app/lib/components/backgroundGradient/backgroundGradient.module.css';
import { circleParams } from '@/app/lib/components/backgroundGradient/backgroundGradient';

export default function BackgroundCircle({
  params,
  isBoardPage,
}: {
  params: circleParams;
  isBoardPage: boolean;
}) {
  const top = !isBoardPage ? params.top : params.top > 34 ? 100 : -48;

  return (
    <div
      className={styles.circle}
      style={
        {
          width: `${params.width}px`,
          height: `${params.height}px`,
          rotate: `${params.rotation}deg`,
          top: `${top}%`,
          left: `${params.left}%`,
          animationDuration: `${params.duration}s`,
          '--circle-color': params.color,
          transition: `top ${params.duration / 2}s ease, left ${
            params.duration / 2
          }s ease, width ${params.duration / 2}s ease, height ${
            params.duration / 2
          }s ease`,
        } as any
      }
    />
  );
}
