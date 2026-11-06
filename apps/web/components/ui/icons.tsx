type SvgProps = { className?: string };

const IconInbox = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 012-2V7z" />
  </svg>
);

const IconLesson = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.586l1.293-1.293a2 2 0 012.828-2.828z" />
  </svg>
);

const IconTask = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2z" />
  </svg>
);

const IconGroup = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconSettings = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  </svg>
);

const IconLogout = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconSearch = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-400 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const IconMessage = ({ className }: SvgProps) => (
  <svg className={`w-5 h-5 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconBell = ({ className }: SvgProps) => (
  <svg className={`w-5 h-5 text-gray-600 relative ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const IconStar = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-purple-500 ${className ?? ""}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-4.717-4.137-4.717 4.137 1.481-8.279-6.064-5.828 8.332-1.151z" />
  </svg>
);

const IconDesign = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-blue-500 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6m-10 4a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6m-4-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6m-4-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6m0-6v2m0-6v2m0 6m0 6m-6-4h2m-4 0h2m-4 0h2m-4 0h2m-4 0h2M12 12a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6m-6-4h2m-4 0h2m-4 0h2m-4 0h2m-4 0h2" />
  </svg>
);

const IconBrand = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-green-500 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const IconCode = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-yellow-500 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const IconHeart = ({ filled = false, className }: { filled?: boolean; className?: string }) => (
  <svg className={`w-4 h-4 ${filled ? "text-red-500 fill-red-500" : "text-gray-400"} ${className ?? ""}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const IconArrowRight = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const IconChevronLeft = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);

const IconMenu = ({ className }: SvgProps) => (
  <svg className={`w-6 h-6 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const IconCart = ({ className }: SvgProps) => (
  <svg className={`w-6 h-6 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

export {
  IconInbox,
  IconLesson,
  IconTask,
  IconGroup,
  IconSettings,
  IconLogout,
  IconSearch,
  IconMessage,
  IconBell,
  IconStar,
  IconDesign,
  IconBrand,
  IconCode,
  IconHeart,
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconMenu,
  IconCart,
};
