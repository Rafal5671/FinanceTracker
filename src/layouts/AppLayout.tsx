import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/ModeToggle'
import { useTransactionStore } from '@/store/transactionStore'
import { useEffect } from 'react'

const nav = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/budgets',      icon: Wallet,          label: 'Budgets' },
  { to: '/categories',   icon: Tag,             label: 'Categories' },
]

export default function AppLayout() {
  const init = useTransactionStore(s => s.init)

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none">Finance Tracker</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Local manager</p>
            </div>
            <ModeToggle/>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Data stored locally
          </p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}