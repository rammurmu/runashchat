"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";

// Context & Libs
import { MCPServerManager } from "./mcp-server-manager";
import { ApiKeyManager } from "./api-key-manager";
import { ThemeToggle } from "./theme-toggle";
import { getUserId, updateUserId } from "@/lib/user-id";
import { useChats } from "@/lib/hooks/use-chats";
import { useMCP } from "@/lib/context/mcp-context";
import { cn } from "@/lib/utils";

/** * FIX: Define the Extended Chat type to include the missing lastMessage property 
 * to resolve the TypeScript compilation error.
 */
interface ExtendedChat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  lastMessage?: string; // The missing property
}

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

  // --- IDENTITY & PERSONALIZATION ---
  const [userId, setUserId] = useState<string>("");
  const [newUserId, setNewUserId] = useState("");
  const [userRole, setUserRole] = useState<"Admin" | "Member" | "Guest">("Member");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  
  // --- NAVIGATION & FILTERING ---
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedChatIds, setPinnedChatIds] = useState<string[]>([]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ General: true, Pinned: true });
  
  // --- DIALOG STATES ---
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
  const { chats, isLoading, deleteChat } = useChats(userId);

  // --- INITIALIZATION & PERSISTENCE ---
  useEffect(() => {
    const id = getUserId();
    if (id) {
      setUserId(id);
      setNewUserId(id);
      const savedRole = localStorage.getItem(`role_${id}`) as any || "Member";
      const savedAccent = localStorage.getItem(`accent_${id}`) || "#3b82f6";
      const savedPins = localStorage.getItem(`pinned_chats_${id}`);
      
      setUserRole(savedRole);
      setAccentColor(savedAccent);
      document.documentElement.style.setProperty('--primary', savedAccent);
      if (savedPins) setPinnedChatIds(JSON.parse(savedPins));
    }
  }, []);

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

  // --- DATA PROCESSING ---
  const groupedChats = useMemo(() => {
    // Cast chats to ExtendedChat to ensure property access is safe
    const typedChats = (chats || []) as ExtendedChat[];
    const filtered = typedChats.filter((chat) => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      Pinned: filtered.filter(c => pinnedChatIds.includes(c.id)),
      General: filtered.filter(c => !pinnedChatIds.includes(c.id))
    };
  }, [chats, searchQuery, pinnedChatIds]);

  const togglePin = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const isPinned = pinnedChatIds.includes(chatId);
    const newPins = isPinned ? pinnedChatIds.filter(id => id !== chatId) : [chatId, ...pinnedChatIds];
    setPinnedChatIds(newPins);
    localStorage.setItem(`pinned_chats_${userId}`, JSON.stringify(newPins));
    toast.info(isPinned ? "Chat unpinned" : "Chat pinned to top");
  };

  const handleUpdateAccent = (color: string) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem(`accent_${userId}`, color);
  };

  const handleExport = () => {
    const data = JSON.stringify(chats, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `runash_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success("History exported");
  };

  if (!userId) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur shadow-2xl" collapsible="icon">
        
        {/* HEADER */}
        <SidebarHeader className="border-b border-border/40 px-4 py-3 space-y-4">
          <div className={cn("flex items-center justify-between h-8", isCollapsed && "justify-center")}>
            <div className="flex items-center gap-3">
               <div className="size-7 rounded-lg flex items-center justify-center shadow-lg transition-all" style={{ backgroundColor: accentColor }}>
                  <Image src="/scira.png" alt="Logo" width={18} height={18} className="brightness-0 invert" unoptimized />
               </div>
               {!isCollapsed && (
                 <div className="flex flex-col">
                   <span className="font-bold text-sm tracking-tight tracking-widest uppercase">RunAsh AI</span>
                   <Badge variant="outline" className="text-[8px] h-3.5 py-0 border-primary/30 text-primary w-fit">{userRole}</Badge>
                 </div>
               )}
            </div>
          </div>

          {!isCollapsed && (
            <div className="relative group flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="sidebar-search"
                  placeholder="Quick Search..."
                  className="h-9 pl-9 pr-12 text-xs bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute right-2 top-2 px-1.5 py-0.5 rounded border border-border/50 bg-background/50 text-[9px] font-mono text-muted-foreground pointer-events-none group-focus-within:opacity-0">⌘K</div>
              </div>
            </div>
          )}
        </SidebarHeader>

        {/* CONTENT */}
        <SidebarContent className="scrollbar-none">
          <SidebarGroup className="px-2 pt-4">
            <SidebarGroupLabel className={cn("flex items-center justify-between px-2 mb-2", isCollapsed && "sr-only")}>
              <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-widest">Library</span>
              {!isCollapsed && <button onClick={() => setClearAllConfirmOpen(true)} className="hover:text-destructive transition-colors"><Eraser className="size-3" /></button>}
            </SidebarGroupLabel>
            
            <SidebarMenu>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-9 w-full mb-1 opacity-20" />)
              ) : (
                Object.entries(groupedChats).map(([folderName, folderChats]) => {
                  if (folderChats.length === 0 && folderName === "Pinned") return null;
                  
                  return (
                    <Collapsible key={folderName} defaultOpen={openFolders[folderName]} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="hover:bg-transparent">
                            {folderName === "Pinned" ? <Pin className="size-3.5 text-amber-500" /> : <Folder className="size-3.5 opacity-40" />}
                            {!isCollapsed && <span className="text-xs font-bold ml-1">{folderName}</span>}
                            {!isCollapsed && <ChevronDown className="ml-auto size-3 transition-transform group-data-[state=open]/collapsible:rotate-180" />}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenu className="ml-2 border-l border-border/20 pl-2 mt-1 space-y-0.5">
                            <AnimatePresence mode="popLayout">
                              {folderChats.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <SidebarMenuButton asChild isActive={pathname === `/chat/${chat.id}`} className="h-9 px-2 rounded-md group/item relative">
                                        <Link href={`/chat/${chat.id}`} className="flex items-center gap-2">
                                          <MessageSquare className={cn("size-3.5 transition-colors", pathname === `/chat/${chat.id}` ? "text-primary" : "text-muted-foreground/30")} />
                                          <span className="truncate flex-1 text-xs">{chat.title}</span>
                                          {!isCollapsed && userRole !== "Guest" && (
                                            <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                              <button onClick={(e) => togglePin(chat.id, e)} className="p-1 hover:text-amber-500">{folderName === "Pinned" ? <PinOff className="size-3" /> : <Pin className="size-3" />}</button>
                                              <button onClick={(e) => { e.preventDefault(); setChatToDelete(chat.id); setDeleteConfirmOpen(true); }} className="p-1 hover:text-destructive"><Trash2 className="size-3" /></button>
                                            </div>
                                          )}
                                        </Link>
                                      </SidebarMenuButton>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="w-64 p-3 bg-popover/95 backdrop-blur shadow-2xl border-border/40 pointer-events-none">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                                          <span className="text-[10px] font-bold uppercase text-primary">Preview</span>
                                          <div className="flex items-center gap-1 text-[9px] text-muted-foreground"><Clock className="size-2.5" />{new Date(chat.updatedAt).toLocaleDateString()}</div>
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-foreground/80 line-clamp-3 italic">
                                          {/* FIX: Safe access to lastMessage now typed correctly */}
                                          {chat.lastMessage || "No message preview available..."}
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </SidebarMenuItem>
                              ))}
                            </AnimatePresence>
                          </SidebarMenu>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroup>

          {/* Support Section */}
          <SidebarGroup className="mt-auto px-2 pb-4">
             <SidebarMenu>
               <SidebarMenuItem>
                 <SidebarMenuButton onClick={() => setFeedbackOpen(true)} className="h-9 hover:bg-primary/5">
                   <LifeBuoy className="size-4 opacity-50" />
                   {!isCollapsed && <span className="text-xs">Feedback & Support</span>}
                 </SidebarMenuButton>
               </SidebarMenuItem>
             </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* FOOTER */}
        <SidebarFooter className="p-3 bg-secondary/5 border-t border-border/40">
          <div className="space-y-3">
            <Button 
              className="w-full shadow-lg font-bold transition-all active:scale-95 text-white" 
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
                  <Avatar className="size-8 rounded-lg ring-1 ring-border shadow-sm">
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
                <DropdownMenuLabel className="text-[10px] uppercase font-bold opacity-50 px-2 py-1.5">Manage Workspace</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <Palette className="mr-2 size-4 text-primary" /> Settings & Identity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setApiKeySettingsOpen(true)}>
                  <Key className="mr-2 size-4" /> API Configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExport}><Download className="mr-2 size-4" /> Export History (.json)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center justify-between">
                  <span className="text-xs font-medium flex items-center gap-2"><Sparkles className="size-4" /> Dark Mode</span>
                  <ThemeToggle />
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>

        {/* --- DIALOGS & MANAGERS --- */}

        {/* Workspace Settings */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Workspace Settings</DialogTitle></DialogHeader>
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="appearance">Style</TabsTrigger>
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="roles">Access</TabsTrigger>
              </TabsList>
              <TabsContent value="appearance" className="space-y-4 py-2">
                <Label className="text-xs font-bold uppercase opacity-50">Theme Accent</Label>
                <div className="flex flex-wrap gap-3">
                  {ACCENTS.map(acc => (
                    <button key={acc.name} onClick={() => handleUpdateAccent(acc.color)} className={cn("size-10 rounded-full border-2 border-background shadow-sm transition-transform hover:scale-110 flex items-center justify-center", accentColor === acc.color && "ring-2 ring-primary ring-offset-2")} style={{ backgroundColor: acc.color }}>
                      {accentColor === acc.color && <Check className="size-5 text-white" />}
                    </button>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="identity" className="space-y-4 py-2">
                <Label className="text-xs font-bold uppercase opacity-50">User ID</Label>
                <Input value={newUserId} onChange={(e) => setNewUserId(e.target.value)} />
                <Button className="w-full" style={{ backgroundColor: accentColor }} onClick={() => { updateUserId(newUserId); window.location.reload(); }}>Save & Reload</Button>
              </TabsContent>
              <TabsContent value="roles" className="space-y-2 py-2">
                {["Admin", "Member", "Guest"].map((r: any) => (
                  <Button key={r} variant={userRole === r ? "secondary" : "ghost"} className="w-full justify-between h-12" onClick={() => { setUserRole(r); localStorage.setItem(`role_${userId}`, r); toast.success(`Switched to ${r}`); }}>
                    <div className="flex items-center">{r === "Admin" ? <ShieldCheck className="mr-2 size-4" /> : <User className="mr-2 size-4" />}{r}</div>
                    {userRole === r && <Check className="size-4 text-primary" />}
                  </Button>
                ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader><DialogTitle>Feedback & Support</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex bg-secondary p-1 rounded-lg">
                <button onClick={() => setFeedbackType("feature")} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", feedbackType === "feature" && "bg-background shadow-sm text-primary")}>Feature</button>
                <button onClick={() => setFeedbackType("bug")} className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", feedbackType === "bug" && "bg-background shadow-sm text-destructive")}>Bug</button>
              </div>
              <Textarea placeholder="Details..." className="min-h-[120px]" value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
              <Button className="w-full" style={{ backgroundColor: accentColor }} disabled={!feedbackText.trim()} onClick={() => { toast.success("Sent!"); setFeedbackOpen(false); setFeedbackText(""); }}>Submit Feedback</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Wipe History Dialog */}
        <Dialog open={clearAllConfirmOpen} onOpenChange={setClearAllConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto text-destructive"><AlertTriangle className="size-6" /></div>
              <DialogTitle className="text-center">Wipe History?</DialogTitle>
              <DialogDescription className="text-center">This will permanently delete all {chats.length} conversations. Action is irreversible.</DialogDescription>
            </DialogHeader>
            <div className="py-2 space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground flex justify-center">Type DELETE to confirm</Label>
              <Input value={clearConfirmText} onChange={(e) => setClearConfirmText(e.target.value)} className="text-center font-bold tracking-widest border-destructive/30" placeholder="DELETE" />
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setClearAllConfirmOpen(false); setClearConfirmText(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                if (clearConfirmText === "DELETE") {
                   await Promise.all(chats.map(chat => deleteChat(chat.id)));
                   setClearAllConfirmOpen(false);
                   toast.success("History cleared");
                   router.push("/");
                }
              }} disabled={clearConfirmText !== "DELETE"}>Confirm Wipe</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Single Chat Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[350px]">
            <DialogHeader><DialogTitle className="text-center">Delete Chat?</DialogTitle></DialogHeader>
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={async () => {
                  if (chatToDelete) {
                    await deleteChat(chatToDelete);
                    if (pathname === `/chat/${chatToDelete}`) router.push("/");
                    setDeleteConfirmOpen(false);
                    toast.success("Deleted");
                  }
              }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <MCPServerManager servers={mcpServers} onServersChange={setMcpServers} selectedServers={selectedMcpServers} onSelectedServersChange={setSelectedMcpServers} open={mcpSettingsOpen} onOpenChange={setMcpSettingsOpen} />
        <ApiKeyManager open={apiKeySettingsOpen} onOpenChange={setApiKeySettingsOpen} />
      </Sidebar>
    </TooltipProvider>
  );
}
