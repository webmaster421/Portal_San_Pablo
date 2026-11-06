const Placeholder = ({
  className = "w-full h-24",
  label,
  style,
}: {
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}) => (
  <div className={className} style={style}>
    {label && (
      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
        {label}
      </span>
    )}
  </div>
);

export default Placeholder;
