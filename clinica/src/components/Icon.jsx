const P = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  record: <><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M8 17c1-1.5 2.3-2.2 4-2.2s3 .7 4 2.2" /></>,
  flask: <><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" /><path d="M7.5 15h9" /></>,
  pill: <><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)" /><path d="m9.5 9.5 5 5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  chart: <><path d="M4 4v16h16" /><path d="m8 14 3-3 3 2 5-6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  bell: <><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  alert: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17v.5" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13 7 4 4" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  usercheck: <><circle cx="9" cy="8" r="4" /><path d="M2 21c1.3-3.5 4-5.5 7-5.5 1.4 0 2.6.3 3.7 1" /><path d="m15 18 2 2 4-4" /></>,
  usermiss: <><circle cx="9" cy="8" r="4" /><path d="M2 21c1.3-3.5 4-5.5 7-5.5 1.4 0 2.6.3 3.7 1" /><path d="m16 16 4 4M20 16l-4 4" /></>,
  sofa: <><path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" /><path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M10 2h4" /></>,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  thermo: <><path d="M14 14.5V5a2 2 0 0 0-4 0v9.5a4 4 0 1 0 4 0z" /><path d="M12 9v7" /></>,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  scale: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 9a5 5 0 0 1 8 0l-3 3" /></>,
  building: <><path d="M4 21V5l8-2v18M12 7h8v14" /><path d="M8 8v.5M8 12v.5M8 16v.5M16 11v.5M16 15v.5M2 21h20" /></>,
  chevrons: <path d="m8 9 4-4 4 4M8 15l4 4 4-4" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8" /><path d="M20 3v5h-5" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  arrowright: <path d="M5 12h14m-5-5 5 5-5 5" />,
};

export default function Icon({ name, size = 16, className = '', stroke = 1.8 }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}

export function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38b2c9" />
          <stop offset="1" stopColor="#1f7f9a" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lg)" />
      <path d="M8 17h4l2.2-5 3.6 9 2.2-4h4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
