import Link from "next/link"
import { Button } from "@/components/ui/button"
import AccountGuard from "./AccountGuard"

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AccountGuard>
      <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full lg:w-64">
              <nav className="space-y-2">
                <Link href="/account/profile">
                  <Button
                    variant="ghost"
                    className="w-full justify-end text-right"
                  >
                    پروفایل
                  </Button>
                </Link>
                <Link href="/account/addresses">
                  <Button
                    variant="ghost"
                    className="w-full justify-end text-right"
                  >
                    آدرس‌ها
                  </Button>
                </Link>
                <Link href="/account/orders">
                  <Button
                    variant="ghost"
                    className="w-full justify-end text-right"
                  >
                    سفارش‌ها
                  </Button>
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AccountGuard>
  )
}

