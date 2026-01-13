"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles,
  ChevronsUpDown, Copy, Pencil, Github, Key, UserCircle, AlertTriangle,
  Search, X, Pin, PinOff, Eraser, Download, Folder, ChevronDown, Clock,
  Command, ShieldCheck, User, Palette, Check, LifeBuoy, Send, Bug,
  Lightbulb, HelpCircle
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { MCPServerManager } from "./mcp-server-manager";
import { ApiKeyManager } from "./api-key-manager";
import { ThemeToggle } from "./theme-toggle";
import { getUserId, updateUserId } from "@/lib/user-id";
import { useChats } from "@/lib/hooks/use-chats";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMCP } from "@/lib/context/mcp-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

const ACCENTS = [
  { name: "RunAsh Blue", color: "#3b82f6" },
  { name: "Emerald", color: "#10b981" },
  { name: "Rose", color: "#f43f5e" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Violet", color: "#8b5cf6" },
];

export function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // --- STATE MANAGEMENT ---
  const [userId, setUserId] = useState<string>("");
  const [newUserId, setNewUserId] = useState("");
  const [userRole, setUserRole] = useState<"Admin" | "Member" | "Guest">("Member");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ General: true, Pinned: true });
  
  // Dialog Controllers
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false);
  const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clearAllConfirmOpen, setClearAllConfirmOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [clearConfirmText, setClearConfirmText] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature">("feature");

  const { mcpServers, setMcpServers, selectedMcpServers, setSelectedMcpServers } = useMCP();

  // --- INITIALIZATION ---
  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setNewUserId(id);
    
    const savedRole = localStorage.getItem(`role_${id}`) as any || "Member";
    const savedAccent = localStorage.getItem(`accent_${id}`) || "#3b82f6";
    const savedPins = localStorage.getItem(`pinned_chats_${id}`);
    
    setUserRole(savedRole);
    setAccentColor(savedAccent);
    document.documentElement.style.setProperty('--primary', savedAccent);
    if (savedPins) setPinnedChatIds(JSON.parse(savedPins));
  }, []);

  const { chats, isLoading, deleteChat } = useChats(userId);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("sidebar-search")?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  // --- LOGIC HANDLERS ---
  const groupedChats = useMemo(() => {
    const filtered = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return {
      Pinned: filtered.filter(c => pinnedChatIds.includes(c.id)),
      General: filtered.filter(c => !pinnedChatIds.includes(c.id))
    };
  }, [chats, searchQuery, pinnedChatIds]);

  const togglePin = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const newPins = pinnedChatIds.includes(chatId) 
      ? pinnedChatIds.filter(id => id !== chatId) 
      : [chatId, ...pinnedChatIds];
    setPinnedChatIds(newPins);
    localStorage.setItem(`pinned_chats_${userId}`, JSON.stringify(newPins));
  };

  const handleUpdateAccent = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem(`accent_${userId}`, color);
  };

  const exportHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(chats, null, 2));
    const link = document.createElement('a');
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `runash_backup_${userId}.json`);
    link.click();
    toast.success("JSON Export Complete");
  };

  if (!userId) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur shadow-2xl" collapsible="icon">
        
        {/* HEADER: Branding & Search */}
        <SidebarHeader className="border-b border-border/40 px-4 py-3 space-y-4">
          <div className={cn("flex items-center justify-between h-8", isCollapsed && "justify-center")}>
            <div className="flex items-center gap-3">
               <div className="size-7 rounded-lg flex items-center justify-center shadow-lg" style={{ backgroundColor: accentColor }}>
                  <Image src="/scira.png" alt="Logo" width={18} height={18} className="brightness-0 invert" unoptimized />
               </div>
               {!isCollapsed && (
                 <div className="flex flex-col">
                   <span className="font-bold text-sm tracking-tight">RUNASH AI</span>
                   <span className="text-[9px] text-muted-foreground uppercase font-semibold">{userRole}</span>
                 </div>
               )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="relative group flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground group-focus-within:text-primary" />
                <Input
                  id="sidebar-search"
                  placeholder="Quick search..."
                  className="h-9 pl-9 pr-12 text-xs bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-2 top-2.5 px-1.5 py-0.5 rounded border text-[9px] font-mono opacity-40">⌘K</div>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-secondary/30" onClick={exportHistory} title="Export">
                <Download className="size-4" />
              </Button>
            </div>
          )}
        </SidebarHeader>

        {/* CONTENT: Chat Library */}
        <SidebarContent className="scrollbar-none">
          <SidebarGroup className="px-2 pt-4">
            <SidebarGroupLabel className={cn("flex items-center justify-between px-2 mb-2", isCollapsed && "sr-only")}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Library</span>
              <button onClick={() => setClearAllConfirmOpen(true)} className="hover:text-destructive"><Eraser className="size-3" /></button>
            </SidebarGroupLabel>
            
            <SidebarMenu>
              {isLoading ? (
                <div className="p-2 space-y-2"><Skeleton className="h-8 w-full rounded" /></div>
              ) : (
                Object.entries(groupedChats).map(([folderName, folderChats]) => (
                  (folderChats.length > 0 || folderName !== "Pinned") && (
                    <Collapsible key={folderName} defaultOpen={openFolders[folderName]} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="hover:bg-transparent">
                            {folderName === "Pinned" ? <Pin className="size-3.5 text-amber-500" /> : <Folder className="size-3.5 opacity-50" />}
                            {!isCollapsed && <span className="text-xs font-bold ml-1">{folderName}</span>}
                            {!isCollapsed && <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenu className="ml-2 border-l border-border/20 pl-2 mt-1 space-y-0.5">
                            {folderChats.map((chat) => (
                              <SidebarMenuItem key={chat.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`} className="h-9 px-2 rounded-md group/item">
                                      <Link href={`/chat/${chat.id}`} className="flex items-center gap-2">
                                        <MessageSquare className={cn("size-3.5", pathname === `/chat/${chat.id}` ? "text-primary" : "opacity-30")} />
                                        <span className="truncate flex-1 text-xs">{chat.title}</span>
                                        {!isCollapsed && userRole !== "Guest" && (
                                          <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <button onClick={(e) => togglePin(chat.id, e)} className="p-0.5 hover:text-amber-500">
                                              {folderName === "Pinned" ? <PinOff className="size-3" /> : <Pin className="size-3" />}
                                            </button>
                                            <button onClick={(e) => { e.preventDefault(); setChatToDelete(chat.id); setDeleteConfirmOpen(true); }} className="p-0.5 hover:text-destructive">
                                              <Trash2 className="size-3" />
                                            </button>
                                          </div>
                                        )}
                                      </Link>
                                    </SidebarMenuButton>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="w-64 p-3 bg-popover/95 backdrop-blur shadow-2xl">
                                    <p className="text-[11px] italic text-muted-foreground line-clamp-3">
                                      {(chat.as any).lastMessage || "No message history available."}
                                    
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>

          {/* Support Section */}
          <SidebarGroup className="mt-auto px-2 pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setFeedbackOpen(true)} className="h-9 hover:bg-primary/5">
                  <LifeBuoy className="size-4 opacity-50" />
                  <span>Support & Feedback</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER: Actions & Identity */}
        <SidebarFooter className="p-3 bg-secondary/5 border-t border-border/40">
          <div className="space-y-3">
            <Button 
              className="w-full shadow-lg font-bold" 
              style={{ backgroundColor: accentColor }}
              onClick={() => router.push("/")}
              disabled={userRole === "Guest"}
            >
              <PlusCircle className={cn("size-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && "New Chat"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("w-full p-2 h-auto flex gap-3 hover:bg-secondary/50", isCollapsed && "justify-center")}>
                  <Avatar className="size-8 rounded-lg shadow-sm border border-border/50">
                    <AvatarFallback style={{ color: accentColor, backgroundColor: `${accentColor}15` }} className="text-xs font-bold">
                      {userId.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-left overflow-hidden">
                      <span className="text-xs font-bold truncate w-full">{userId}</span>
                      <span className="text-[9px] uppercase text-muted-foreground">{userRole} Profile</span>
                    </div>
                  )}
                  <Settings className="size-3.5 ml-auto text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" side="right" align="end" sideOffset={12}>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Palette className="mr-2 size-4 text-primary" /> Workspace Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setApiKeySettingsOpen(true)}>
                  <Key className="mr-2 size-4" /> API Keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center justify-between"><span className="text-xs font-medium">Dark Mode</span><ThemeToggle /></div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>

        {/* --- DIALOGS (Combined Settings) --- */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Settings</DialogTitle></DialogHeader>
            <Tabs defaultValue="appearance">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="appearance">Style</TabsTrigger>
                <TabsTrigger value="identity">ID</TabsTrigger>
                <TabsTrigger value="role">Role</TabsTrigger>
              </TabsList>
              <TabsContent value="appearance" className="space-y-4 pt-4">
                <Label className="text-xs font-bold">Brand Color</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map(acc => (
                    <button key={acc.name} onClick={() => handleUpdateAccent(acc.color)} className="size-9 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-110 flex items-center justify-center" style={{ backgroundColor: acc.color }}>
                      {accentColor === acc.color && <Check className="size-4 text-white" />}
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="role" className="pt-4 space-y-2">
                {["Admin", "Member", "Guest"].map(r => (
                  <Button key={r} variant={userRole === r ? "default" : "outline"} className="w-full justify-start h-12" onClick={() => { setUserRole(r as any); localStorage.setItem(`role_${userId}`, r); }}>
                    {r === "Admin" ? <ShieldCheck className="mr-2 size-4" /> : <User className="mr-2 size-4" />}
                    {r} {userRole === r && " (Active)"}
                  </Button>
                ))}
              </TabsContent>
              <TabsContent value="identity" className="pt-4"><Input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} /><Button className="w-full mt-4" onClick={() => { updateUserId(newUserId); window.location.reload(); }}>Save & Reload</Button></TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Feedback</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Button variant={feedbackType === "feature" ? "default" : "outline"} size="sm" onClick={() => setFeedbackType("feature")} className="flex-1"><Lightbulb className="mr-2 size-3" /> Idea</Button>
                <Button variant={feedbackType === "bug" ? "default" : "outline"} size="sm" onClick={() => setFeedbackType("bug")} className="flex-1"><Bug className="mr-2 size-3" /> Bug</Button>
              </div>
              <Textarea placeholder="How can we improve?" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
              <Button className="w-full" disabled={!feedbackText.trim()} onClick={() => { toast.success("Feedback received!"); setFeedbackOpen(false); setFeedbackText(""); }}>Send Feedback</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* individual Clear All and Delete dialogs remain standard shadcn components */}
        <MCPServerManager servers={mcpServers} onServersChange={setMcpServers} selectedServers={selectedMcpServers} onSelectedServersChange={setSelectedMcpServers} open={mcpSettingsOpen} onOpenChange={setMcpSettingsOpen} />
        <ApiKeyManager open={apiKeySettingsOpen} onOpenChange={setApiKeySettingsOpen} />
      </Sidebar>
    </TooltipProvider>
  );
  }
