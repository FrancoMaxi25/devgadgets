export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Dev<span className="text-violet-400">Gadgets</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Tu setup, al siguiente nivel</p>
        </div>
        {children}
      </div>
    </div>
  )
}