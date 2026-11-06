"use client";

/* ----------------------------------------------------------------
   Iconos simples (SVG inline)
----------------------------------------------------------------- */
type SvgProps = { className?: string };

const IconInbox = ({ className }: SvgProps) => (
  <svg className={`w-4 h-4 text-gray-600 ${className ?? ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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

/* ----------------------------------------------------------------
   Placeholder genérico para esqueleto de contenido
----------------------------------------------------------------- */
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

const SkeletonLine = ({ w = "full", h = "4" }: { w?: string; h?: string }) => (
  <div className={`bg-gray-200 rounded h-${h} w-${w}`} />
);

const SkeletonAvatar = () => (
  <div className="bg-gray-200 rounded-full w-8 h-8" />
);

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function DashboardPage() {
  const navItems = [
   
    { name: "Inicio", icon: <IconInbox />, active: false },
    { name: "Autores", icon: <IconLesson />, active: false },
    { name: "Novedades", icon: <IconTask />, active: false },
    { name: "Promociones", icon: <IconGroup />, active: false },
  ];

  const friends = [
    {  },
    {  },
    {  },
  ];

  const continueWatching = [
    { image: "https://images.unsplash.com/photo-1582750423344-6e7b54bd745a?w=400&h=225&fit=crop", label: "FRONTEND", title: "React Advanced Patterns", mentor: "Leonardo samsul", fav: false },
    { image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop", label: "UI/UX DESIGN", title: "Design Systems 101", mentor: "Bayu Salto", fav: true },
    
  ];



  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <aside
        className="w-[15%] bg-white border-r border-gray-200 z-20 hidden lg:block flex flex-col h-screen shrink-0"
      >
        <div className="p-5 border-b border-gray-100 flex items-center gap-2 shrink-0">
          
          <span className="text-xl font-bold text-gray-900 tracking-tight">San Pablo</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">OVERVIEW</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {}}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  item.active ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">FRIENDS</h2>
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.name} className="flex items-center gap-3">
                <SkeletonAvatar />
                <div className="flex-1 min-w-0">
                  <Placeholder className="placeholder-text-sm" label={friend.name} />
                  <Placeholder className="placeholder-text-sm" label={friend.subtitle} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 mt-auto border-t border-gray-100 pt-4 shrink-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">SETTINGS</h2>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium">
              <div className="placeholder-box w-4 h-4" />
              <span>Setting</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium">
              <div className="placeholder-box w-4 h-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ============================
         COLUMNA CENTRAL - 70%
      ============================ */}
      <main className="w-[70%] bg-gray-50 flex flex-col h-screen overflow-hidden shrink-0">
        {/* Encabezado superior */}
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 max-w-full">
            <div className="relative w-full">
              <div className="placeholder-box w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search your course..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Placeholder className="w-5 h-5" />
            <Placeholder className="w-5 h-5 relative" />
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="text-right hidden sm:block">
              
              </div>
              <SkeletonAvatar />
            </div>
          </div>
        </header>

        {/* Contenido scrollable central */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Banner Hero */}
          <section className="relative rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white mb-8 overflow-hidden h-100">
            
          </section>

          {/* Fila de tarjetas de progreso */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            
          </div>

          {/* Sección Continue Watching */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Placeholder className="placeholder-text-lg w-48" />
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <IconChevronLeft className="w-3 h-3" />
                <IconChevronRight className="w-3 h-3" />
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {continueWatching.map((course) => (
                <div key={course.title} className="flex-shrink-0 w-64 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="relative aspect-video bg-gray-200">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full">{course.fav ? <IconHeart filled={true} /> : <IconHeart />}</button>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md w-20">{course.label}</span>
                  </div>
                  <div className="p-3">
                    <Placeholder className="placeholder-text-sm" label={course.title} />
                    <Placeholder className="placeholder-text-sm" label={course.mentor} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sección Your Lesson */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Placeholder className="placeholder-text-lg w-40" />
              <Placeholder className="text-sm text-purple-600 font-medium w-20" label="See all" />
            </div>
            <div className="skeleton-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[ "MENTOR", "TYPE", "DESC", "ACTION" ].map((h) => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                        <Placeholder className="placeholder-text-sm w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* ============================
         COLUMNA DERECHA - 15%
      ============================ */}
      <aside className="w-[15%] bg-white border-l border-gray-200 shrink-0 hidden lg:block flex flex-col h-screen overflow-hidden">
        {/* Statistic */}
        <div className="skeleton-card p-5 mb-5 shrink-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
          
        </div>

        {/* Your mentor */}
        <div className="skeleton-card p-5 shrink-0">
          

        </div>
      </aside>
    </div>
  );
}
