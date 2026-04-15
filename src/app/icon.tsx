import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0a0f14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: '-0.05em',
          color: 'hsl(195, 80%, 50%)',
          fontFamily: 'sans-serif',
        }}
      >
        D
      </div>
    ),
    size,
  );
}
