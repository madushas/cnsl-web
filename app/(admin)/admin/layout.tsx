"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AdminSiteHeader } from '@/components/admin/site-header-admin'
import { Breadcrumb } from '@/components/admin/breadcrumb'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{
        // Align with the example dashboard layout
        ['--sidebar-width' as any]: 'calc(var(--spacing) * 72)',
        ['--header-height' as any]: 'calc(var(--spacing) * 12)'
      }}
    >
      <AppSidebar variant="inset" menu="admin" />
      <SidebarInset>
        <AdminSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Breadcrumb />
              </div>
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
