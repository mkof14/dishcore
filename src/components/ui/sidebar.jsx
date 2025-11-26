import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const SidebarContext = React.createContext({
  open: true,
  setOpen: () => {},
  isMobile: false
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({ children, defaultOpen = true }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setOpen(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ className, children, ...props }) {
  const { open, isMobile } = useSidebar()

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {}}
        />
      )}
      <aside
        className={cn(
          "flex flex-col h-screen transition-all duration-300 z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          open ? "w-64" : "w-0",
          !open && "overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </aside>
    </>
  )
}

export function SidebarHeader({ className, children, ...props }) {
  const { open } = useSidebar()
  if (!open) return null
  
  return (
    <div className={cn("flex-shrink-0", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ className, children, ...props }) {
  const { open } = useSidebar()
  if (!open) return null

  return (
    <div className={cn("flex-1 overflow-y-auto", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ className, children, ...props }) {
  const { open } = useSidebar()
  if (!open) return null

  return (
    <div className={cn("flex-shrink-0", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroup({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupLabel({ className, children, ...props }) {
  return (
    <div className={cn("text-xs font-medium uppercase tracking-wider", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupContent({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ className, children, ...props }) {
  return (
    <nav className={cn("space-y-1", className)} {...props}>
      {children}
    </nav>
  )
}

export function SidebarMenuItem({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuButton({ className, asChild, children, ...props }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(
        "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors",
        "hover:bg-white/10",
        className,
        children.props.className
      ),
      ...props
    })
  }

  return (
    <button
      className={cn(
        "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors",
        "hover:bg-white/10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarTrigger({ className, ...props }) {
  const { open, setOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(!open)}
      className={cn("", className)}
      {...props}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )
}