"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles,
  ChevronsUpDown, Copy, Pencil, Search, X, Pin, PinOff, Eraser, 
  Download, Folder, ChevronDown, Clock, Command, ShieldCheck, 
  User, Palette, Check, LifeBuoy, Globe, Activity, Settings2
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Custom Components
import { MCPServerManager } from "./mcp-server-manager";
import { useChats } from "@/lib/hooks/use-chats";

export function ChatSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // --- UI States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [mcpOpen, setMcpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState("#3b82f6");

  const user = session?.user;
  const userRole = (user as any)?.role || "Member";
  const { chats, isLoading, deleteChat } = useChats(user?.id || "");

  // --- Logic ---
  const filteredChats = useMemo(() => {
    return (chats || []).filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

  useEffect(() => {
    const savedAccent = localStorage.getItem("accent_color") || "#3b82f6";
    setAccentColor(savedAccent);
    document.documentElement.style.setProperty('--primary', savedAccent);
  }, []);

  if (status === "loading") return <div className="p-8"><Clock className="animate-spin" /></div>;

  return (
    <TooltipProvider delayDuration={400}>
      <Sidebar collapsible="icon" className="border-r border-zinc-800 bg-[#0b0b0f] text-zinc-400">
        
        {/* Header: Logo & Search */}
        <SidebarHeader className="p-4 space-y-4 border-b border-zinc-800/50">
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="size-8 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: accentColor }}>
              <Image src="/scira.png" alt="Logo" width={20} height={20} className="brightness-0 invert" unoptimized />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm text-zinc-100 tracking-tight">RunAsh AI</span>
                <Badge variant="outline" className="text-[9px] h-3.5 py-0 border-primary/30 text-primary w-fit uppercase font-bold">
                  {userRole}
                </Badge>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-500 group-focus-within:text-primary transition-colors" />
              <Input
                id="sidebar-search"
                placeholder="Search history..."
                className="h-9 pl-9 pr-12 text-xs bg-zinc-900/50 border-none focus-visible:ring-1 focus-visible:ring-primary/40 text-zinc-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-2 top-2.5 px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-[9px] font-mono opacity-40">⌘K</div>
            </div>
          )}
        </SidebarHeader>

        {/* Content: Chats & MCP */}
        <SidebarContent className="scrollbar-none">
          <SidebarGroup className="px-2 pt-4">
            <SidebarGroupLabel className={cn("px-2 mb-2 text-[10px] font-bold uppercase text-zinc-500 tracking-widest", isCollapsed && "sr-only")}>
              Conversations
            </SidebarGroupLabel>
            <SidebarMenu>
              <AnimatePresence mode="popLayout">
                {filteredChats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`} className="group h-10 rounded-md px-3 transition-all hover:bg-zinc-900">
                          <Link href={`/chat/${chat.id}`} className="flex items-center gap-3">
                            <MessageSquare className={cn("size-4 transition-colors", pathname === `/chat/${chat.id}` ? "text-primary" : "text-zinc-600")} />
                            <span className="truncate flex-1 text-sm font-medium text-zinc-300 group-hover:text-zinc-100">{chat.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="w-64 p-3 bg-zinc-900 border-zinc-800 shadow-2xl">
                        <p className="text-[11px] leading-relaxed italic text-zinc-400">
                          {(chat as any).lastMessage || "No preview available..."}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                ))}
              </AnimatePresence>
            </SidebarMenu>
          </SidebarGroup>

          <Separator className="mx-4 bg-zinc-800/50" />

          {/* MCP Server Shortcut */}
          <SidebarGroup className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setMcpOpen(true)} className="h-10 hover:bg-blue-500/5 group">
                  <Globe className="size-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm font-medium">MCP Servers</span>
                  {!isCollapsed && <Badge className="ml-auto bg-blue-500/10 text-blue-400 border-none text-[10px]">2</Badge>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer: User & Settings */}
        <SidebarFooter className="p-3 bg-zinc-900/20 border-t border-zinc-800/50 mt-auto">
          <div className="space-y-3">
            <Button 
              className="w-full shadow-lg font-bold text-white transition-transform active:scale-95" 
              style={{ backgroundColor: accentColor }}
              onClick={() => router.push("/")}
            >
              <PlusCircle className={cn("size-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && "New Chat"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("w-full p-2 h-auto flex gap-3 hover:bg-zinc-800", isCollapsed && "justify-center")}>
                  <Avatar className="size-8 rounded-lg border border-zinc-700 shadow-sm">
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback style={{ color: accentColor, backgroundColor: `${accentColor}15` }} className="text-xs font-bold">
                      {user?.name?.substring(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-left overflow-hidden">
                      <span className="text-xs font-bold text-zinc-100 truncate w-full">{user?.name}</span>
                      <span className="text-[9px] text-zinc-500 truncate w-full uppercase tracking-tighter">{userRole} Profile</span>
                    </div>
                  )}
                  <Settings className="size-3.5 ml-auto text-zinc-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-100" side="right" align="end" sideOffset={12}>
                <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-40 px-2 py-1.5">Account Security</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Palette className="mr-2 size-4 text-primary" /> Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem onClick={() => signOut()} className="text-red-400 hover:text-red-300">
                  <X className="mr-2 size-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>

        {/* --- Dialogs --- */}
        <MCPServerManager open={mcpOpen} onOpenChange={setMcpOpen} />
        
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Workspace Settings</DialogTitle>
              <DialogDescription className="text-zinc-500">Manage your identity and app appearance.</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="appearance">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
                <TabsTrigger value="appearance">Style</TabsTrigger>
                <TabsTrigger value="access">Access</TabsTrigger>
              </TabsList>
              <TabsContent value="appearance" className="space-y-4 pt-4">
                <span className="text-xs font-bold uppercase text-zinc-500">Accent Color</span>
                <div className="flex flex-wrap gap-3">
                  {["#3b82f6", "#10b981", "#f43f5e", "#f59e0b", "#8b5cf6"].map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setAccentColor(color);
                        localStorage.setItem("accent_color", color);
                        document.documentElement.style.setProperty('--primary', color);
                      }}
                      className={cn("size-9 rounded-full border-2 border-background transition-transform hover:scale-110", accentColor === color && "ring-2 ring-primary ring-offset-2")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="access" className="pt-4">
                <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/40 flex items-start gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-bold">{userRole} Authorization</p>
                    <p className="text-xs text-zinc-500">Your account is secured via OAuth. Sessions are encrypted and stored via HTTP-only cookies.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

      </Sidebar>
    </TooltipProvider>
  );
  }
