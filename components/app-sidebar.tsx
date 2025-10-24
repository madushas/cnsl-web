"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@stackframe/stack"

const data = {
  navMain: [
    { title: 'Dashboard', url: '/admin', icon: IconDashboard },
    { title: 'Events', url: '/admin/events', icon: IconListDetails },
    { title: 'People', url: '/admin/people', icon: IconUsers },
    { title: 'Posts', url: '/admin/posts', icon: IconFileDescription },
    { title: 'Ticket Templates', url: '/admin/ticket-templates', icon: IconFileDescription },
  ],
  navClouds: [] as unknown[],
  navSecondary: [
    { title: 'Settings', url: '#', icon: IconSettings },
    { title: 'Get Help', url: '#', icon: IconHelp },
  ],
  documents: [],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & { menu?: 'default' | 'admin' }

export function AppSidebar({ menu = 'default', ...props }: AppSidebarProps) {
  const user = useUser()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">CNSL</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary.filter(i => i.url && i.url !== '#')} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {
          user ? (
            <NavUser />
          ) : null
        }
      </SidebarFooter>
    </Sidebar>
  )
}
