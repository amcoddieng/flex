import * as React from 'react'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { cva } from 'class-variance-authority'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        'group flex flex-1 list-none items-center justify-center gap-1',
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-xl bg-background px-5 py-2.5 text-sm font-bold hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:text-slate-900 focus:bg-gradient-to-r focus:from-primary/10 focus:to-violet-500/10 focus:text-slate-900 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-gradient-to-r data-[state=open]:hover:from-primary/10 data-[state=open]:hover:to-violet-500/10 data-[state=open]:text-slate-900 data-[state=open]:focus:bg-gradient-to-r data-[state=open]:focus:from-primary/10 data-[state=open]:focus:to-violet-500/10 data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/5 data-[state=open]:to-violet-500/5 focus-visible:ring-ring/50 outline-none transition-all duration-300 hover:-translate-y-1 btn-hover-lift focus-visible:ring-[3px] focus-visible:outline-1 shadow-sm hover:shadow-md',
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), 'group', className)}
      {...props}
    >
      {children}{' '}
      <ChevronDownIcon
        className="relative top-[1px] ml-2 size-4 transition-all duration-300 group-data-[state=open]:rotate-180 group-hover:text-primary animate-pulse"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-3 pr-3.5 md:absolute md:w-auto',
        'group-data-[viewport=false]/navigation-menu:bg-gradient-to-br group-data-[viewport=false]/navigation-menu:from-white group-data-[viewport=false]/navigation-menu:to-slate-50 group-data-[viewport=false]/navigation-menu:text-slate-900 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-bounce-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-fade-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:scale-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:scale-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-2 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-2xl group-data-[viewport=false]/navigation-menu:border-2 group-data-[viewport=false]/navigation-menu:border-slate-200/50 group-data-[viewport=false]/navigation-menu:shadow-xl group-data-[viewport=false]/navigation-menu:shadow-slate-900/10 group-data-[viewport=false]/navigation-menu:duration-300 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={'absolute top-full left-0 isolate z-50 flex justify-center'}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          'origin-top-center bg-gradient-to-br from-white to-slate-50 text-slate-900 data-[state=open]:animate-bounce-in data-[state=closed]:animate-fade-out data-[state=closed]:scale-out-95 data-[state=open]:scale-in-95 relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-2xl border-2 border-slate-200/50 shadow-xl shadow-slate-900/10 md:w-[var(--radix-navigation-menu-viewport-width)]',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-gradient-to-r data-[active=true]:focus:from-primary/10 data-[active=true]:focus:to-violet-500/10 data-[active=true]:hover:bg-gradient-to-r data-[active=true]:hover:from-primary/10 data-[active=true]:hover:to-violet-500/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/5 data-[active=true]:to-violet-500/5 data-[active=true]:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:text-slate-900 focus:bg-gradient-to-r focus:from-primary/10 focus:to-violet-500/10 focus:text-slate-900 focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-2 rounded-xl p-3 text-sm transition-all duration-300 hover:-translate-y-1 btn-hover-lift outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-5 [&_svg]:text-primary",
        className,
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        'data-[state=visible]:animate-scale-in data-[state=hidden]:animate-fade-out data-[state=hidden]:scale-out-95 data-[state=visible]:scale-in-95 top-full z-[1] flex h-2 items-end justify-center overflow-hidden',
        className,
      )}
      {...props}
    >
      <div className="bg-gradient-to-br from-primary to-violet-600 relative top-[60%] h-2.5 w-2.5 rotate-45 rounded-tl-sm shadow-lg animate-glow" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
