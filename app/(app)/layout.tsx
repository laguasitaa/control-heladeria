import { Sidebar, BottomNav } from '@/components/nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <Sidebar />
      <main className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
