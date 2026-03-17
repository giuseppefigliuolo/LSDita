interface Props {
  name: string
  size?: number
  className?: string
}

export default function ExerciseIllustration({ name, size = 80, className = '' }: Props) {
  const Svg = illustrations[name] ?? illustrations['default']
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Svg size={size} />
    </div>
  )
}

function SvgWrap({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  )
}

function MaxHang({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <rect x="20" y="4" width="40" height="8" rx="3" stroke="#E8175D" strokeWidth="2" />
      <line x1="32" y1="12" x2="32" y2="18" stroke="#E8175D" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="12" x2="48" y2="18" stroke="#E8175D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="32" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="38" x2="40" y2="56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="32" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="48" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="34" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="46" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function MaxHangOpen({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <rect x="20" y="4" width="40" height="8" rx="3" stroke="#00B4D8" strokeWidth="2" />
      <path d="M30 12 C30 12 28 16 30 18" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 12 C50 12 52 16 50 18" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="32" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="38" x2="40" y2="56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="30" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="50" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="34" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="46" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function DeadHangBalls({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="28" cy="10" r="7" stroke="#8B35A6" strokeWidth="2" />
      <circle cx="52" cy="10" r="7" stroke="#8B35A6" strokeWidth="2" />
      <line x1="28" y1="17" x2="28" y2="20" stroke="#8B35A6" strokeWidth="1.5" />
      <line x1="52" y1="17" x2="52" y2="20" stroke="#8B35A6" strokeWidth="1.5" />
      <circle cx="40" cy="34" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="40" x2="40" y2="58" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="46" x2="28" y2="20" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="46" x2="52" y2="20" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="58" x2="34" y2="74" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="58" x2="46" y2="74" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function LegRaises({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <line x1="30" y1="4" x2="50" y2="4" stroke="#FFD23F" strokeWidth="2" strokeLinecap="round" />
      <line x1="34" y1="4" x2="34" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="46" y1="4" x2="46" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="18" r="5" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="23" x2="40" y2="44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="24" y2="44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="56" y2="44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function WeightedPullup({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <line x1="20" y1="4" x2="60" y2="4" stroke="#FFD23F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="22" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="28" x2="40" y2="50" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="34" x2="30" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="34" x2="50" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="50" x2="34" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="50" x2="46" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="40" cy="54" r="4" stroke="#E8175D" strokeWidth="1.5" />
    </SvgWrap>
  )
}

function Lockoff({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <line x1="20" y1="4" x2="60" y2="4" stroke="#FFD23F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="20" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="26" x2="40" y2="48" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="40 32 36 10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <polyline points="40 32 50 24 52 10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="40" y1="48" x2="34" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="46" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function HammerCurl({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="14" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="20" x2="40" y2="48" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <polyline points="40 30 32 40 32 32" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <polyline points="40 30 48 40 48 32" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="28" y="30" width="4" height="6" rx="1" stroke="#E8175D" strokeWidth="1.5" />
      <rect x="48" y="30" width="4" height="6" rx="1" stroke="#E8175D" strokeWidth="1.5" />
      <line x1="40" y1="48" x2="34" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="46" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function ScapularPull({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <line x1="20" y1="4" x2="60" y2="4" stroke="#FFD23F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="24" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="30" x2="40" y2="52" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="34" x2="32" y2="8" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="34" x2="48" y2="8" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M34 18 L40 22 L46 18" stroke="#00B4D8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="40" y1="52" x2="34" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="46" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function HollowBody({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <path d="M16 50 Q40 30 64 50" stroke="#F5F5F7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="47" r="4" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="14" y1="40" x2="8" y2="34" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="42" x2="6" y2="40" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="46" x2="72" y2="38" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="58" y1="48" x2="70" y2="44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="58" x2="56" y2="58" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="4 2" />
    </SvgWrap>
  )
}

function Repeaters({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <rect x="20" y="4" width="40" height="8" rx="3" stroke="#E8175D" strokeWidth="2" />
      <circle cx="40" cy="30" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="36" x2="40" y2="54" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="42" x2="32" y2="16" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="42" x2="48" y2="16" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="54" x2="34" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="54" x2="46" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <text x="12" y="76" fontSize="8" fill="#E8175D" fontFamily="monospace" fontWeight="bold">7s</text>
      <text x="58" y="76" fontSize="8" fill="#00B4D8" fontFamily="monospace" fontWeight="bold">3s</text>
    </SvgWrap>
  )
}

function RepeatersBalls({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="28" cy="10" r="7" stroke="#8B35A6" strokeWidth="2" />
      <circle cx="52" cy="10" r="7" stroke="#8B35A6" strokeWidth="2" />
      <circle cx="40" cy="32" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="38" x2="40" y2="56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="28" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="44" x2="52" y2="18" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="34" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="56" x2="46" y2="72" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <text x="12" y="76" fontSize="8" fill="#E8175D" fontFamily="monospace" fontWeight="bold">5s</text>
      <text x="58" y="76" fontSize="8" fill="#00B4D8" fontFamily="monospace" fontWeight="bold">5s</text>
    </SvgWrap>
  )
}

function NegativePullup({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <line x1="20" y1="4" x2="60" y2="4" stroke="#FFD23F" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="20" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="26" x2="40" y2="48" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="32" x2="34" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="32" x2="46" y2="10" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="34" y2="64" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="46" y2="64" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 20 L56 50" stroke="#E8175D" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arrow)" />
      <polygon points="56,52 53,46 59,46" fill="#E8175D" />
    </SvgWrap>
  )
}

function BandShoulder({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="14" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="20" x2="40" y2="48" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 32 Q20 26 18 32 Q16 38 24 36" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M52 32 Q60 26 62 32 Q64 38 56 36" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="40" y1="28" x2="28" y2="32" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="28" x2="52" y2="32" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="34" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="48" x2="46" y2="66" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function ForearmStretch({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="18" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="24" x2="40" y2="42" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 32 L28 40 L28 50" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 32 L52 40 L52 50" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="40" y1="42" x2="34" y2="60" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="42" x2="46" y2="60" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="54" x2="60" y2="54" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M24 48 Q28 44 32 48" stroke="#8B35A6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </SvgWrap>
  )
}

function PigeonPose({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="28" cy="30" r="5" stroke="#F5F5F7" strokeWidth="1.5" />
      <path d="M28 35 L28 48" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 48 L20 56 L16 56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M28 48 L48 52 L64 52" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="12" y1="60" x2="68" y2="60" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
    </SvgWrap>
  )
}

function FrogStretch({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="24" r="5" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="29" x2="40" y2="42" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 42 L22 54 L18 54" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M40 42 L58 54 L62 54" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M24 50 L24 58" stroke="#8B35A6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 50 L56 58" stroke="#8B35A6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="62" x2="68" y2="62" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
    </SvgWrap>
  )
}

function ShoulderDislocates({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="24" r="6" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="40" y1="30" x2="40" y2="52" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 20 Q28 8 40 16 Q52 8 62 20" stroke="#00B4D8" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 22 L18 20" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 22 L62 20" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="34" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="46" y2="68" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

function ThoracicRotation({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="24" cy="36" r="5" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="24" y1="41" x2="56" y2="41" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 41 L36 54 L30 60" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M36 41 L36 54 L42 60" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 36 L20 22" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M44 38 L54 24" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 28 Q56 20 54 24" stroke="#8B35A6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="12" y1="64" x2="68" y2="64" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
    </SvgWrap>
  )
}

function CatCow({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <path d="M14 40 Q28 24 40 40 Q52 56 66 40" stroke="#F5F5F7" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="40" r="3" stroke="#F5F5F7" strokeWidth="1.5" />
      <line x1="14" y1="43" x2="14" y2="54" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="66" y1="40" x2="66" y2="54" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="48" x2="28" y2="58" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="52" y1="48" x2="52" y2="58" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="60" x2="70" y2="60" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
    </SvgWrap>
  )
}

function HamstringStretch({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="26" cy="32" r="5" stroke="#F5F5F7" strokeWidth="1.5" />
      <path d="M26 37 L40 44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 44 L62 44" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 44 L32 56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M40 44 L48 56" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 36 L50 36" stroke="#F5F5F7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="60" x2="68" y2="60" stroke="#8E8EA0" strokeWidth="1" strokeDasharray="3 2" />
    </SvgWrap>
  )
}

function DefaultIllustration({ size }: { size: number }) {
  return (
    <SvgWrap size={size}>
      <circle cx="40" cy="24" r="8" stroke="#8E8EA0" strokeWidth="1.5" />
      <line x1="40" y1="32" x2="40" y2="52" stroke="#8E8EA0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="38" x2="26" y2="46" stroke="#8E8EA0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="38" x2="54" y2="46" stroke="#8E8EA0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="30" y2="68" stroke="#8E8EA0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="52" x2="50" y2="68" stroke="#8E8EA0" strokeWidth="1.5" strokeLinecap="round" />
    </SvgWrap>
  )
}

const illustrations: Record<string, React.FC<{ size: number }>> = {
  'max-hang': MaxHang,
  'max-hang-open': MaxHangOpen,
  'dead-hang-balls': DeadHangBalls,
  'leg-raises': LegRaises,
  'weighted-pullup': WeightedPullup,
  'lockoff': Lockoff,
  'hammer-curl': HammerCurl,
  'scapular-pull': ScapularPull,
  'hollow-body': HollowBody,
  'repeaters': Repeaters,
  'repeaters-balls': RepeatersBalls,
  'negative-pullup': NegativePullup,
  'band-shoulder': BandShoulder,
  'forearm-stretch': ForearmStretch,
  'pigeon-pose': PigeonPose,
  'frog-stretch': FrogStretch,
  'shoulder-dislocates': ShoulderDislocates,
  'thoracic-rotation': ThoracicRotation,
  'cat-cow': CatCow,
  'hamstring-stretch': HamstringStretch,
  'default': DefaultIllustration,
}
