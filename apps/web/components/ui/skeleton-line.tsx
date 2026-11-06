const SkeletonLine = ({ w = "full", h = "4" }: { w?: string; h?: string }) => (
  <div className={`bg-gray-200 rounded h-${h} w-${w}`} />
);

export default SkeletonLine;
