interface MdiIconProps {
  path: string;
  size?: number;
}

export const MdiIcon = ({ path, size = 24 }: MdiIconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d={path} fill="currentColor" />
  </svg>
);
