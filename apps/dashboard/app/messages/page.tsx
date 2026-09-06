"use client";

import Link from "next/link";
import {
  Activity,
  Archive,
  ArrowLeft,
  BarChart3,
  Check,
  CheckCheck,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Dumbbell,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Tag,
  TrendingUp,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import DashboardSidebar from "../dashboard-sidebar";
import MobileNavigation from "../mobile-navigation";
import ProfileMenu from "../profile-menu";
import { getInitials, useSession } from "../session-provider";

type View = "Inbox" | "Campaigns" | "Templates";
type InboxFilter = "All" | "Unread";
type Message = { id: number; from: "member" | "team"; body: string; time: string; read?: boolean };

const conversations = [
  {
    id: "neha",
    name: "Neha Sharma",
    initials: "NS",
    color: "pink",
    preview: "Yes, I can come in on Monday evening.",
    time: "2m",
    unread: 2,
    channel: "WhatsApp",
    status: "At risk",
    online: true,
    plan: "Annual Unlimited",
    phone: "+91 98765 43210",
    joined: "12 Mar 2024",
    renewal: "20 Aug 2026",
    visits: "3 this month",
  },
  {
    id: "aarav",
    name: "Aarav Mehta",
    initials: "AM",
    color: "violet",
    preview: "Thanks for checking in. I have been travelling.",
    time: "18m",
    unread: 1,
    channel: "WhatsApp",
    status: "At risk",
    online: false,
    plan: "Strength Pro",
    phone: "+91 98203 77140",
    joined: "06 Nov 2025",
    renewal: "14 Aug 2026",
    visits: "No visit in 18 days",
  },
  {
    id: "kabir",
    name: "Kabir Singh",
    initials: "KS",
    color: "blue",
    preview: "Could you share the weekend class schedule?",
    time: "1h",
    unread: 3,
    channel: "SMS",
    status: "Active",
    online: true,
    plan: "Monthly Flex",
    phone: "+91 99102 18402",
    joined: "08 Aug 2026",
    renewal: "08 Sep 2026",
    visits: "New member",
  },
  {
    id: "ishita",
    name: "Ishita Rao",
    initials: "IR",
    color: "amber",
    preview: "Perfect, thank you!",
    time: "3h",
    unread: 0,
    channel: "WhatsApp",
    status: "Active",
    online: false,
    plan: "Strength Pro",
    phone: "+91 98110 62291",
    joined: "19 Jan 2025",
    renewal: "29 Aug 2026",
    visits: "8 this month",
  },
  {
    id: "rohan",
    name: "Rohan Kapoor",
    initials: "RK",
    color: "blue",
    preview: "I will update my card this evening.",
    time: "Yesterday",
    unread: 1,
    channel: "SMS",
    status: "Payment due",
    online: false,
    plan: "Monthly Flex",
    phone: "+91 98996 42771",
    joined: "03 May 2026",
    renewal: "Overdue",
    visits: "5 this month",
  },
  {
    id: "ananya",
    name: "Ananya Verma",
    initials: "AV",
    color: "pink",
    preview: "Loved today’s mobility class!",
    time: "Yesterday",
    unread: 0,
    channel: "WhatsApp",
    status: "Active",
    online: false,
    plan: "Annual Unlimited",
    phone: "+91 99878 11245",
    joined: "22 Sep 2025",
    renewal: "22 Sep 2026",
    visits: "14 this month",
  },
  {
    id: "rahul",
    name: "Rahul Jain",
    initials: "RJ",
    color: "amber",
    preview: "Payment received. Thank you.",
    time: "Fri",
    unread: 0,
    channel: "SMS",
    status: "Active",
    online: false,
    plan: "Monthly Flex",
    phone: "+91 98670 41820",
    joined: "14 Feb 2026",
    renewal: "14 Aug 2026",
    visits: "9 this month",
  },
];

const initialThreads: Record<string, Message[]> = {
  neha: [
    {
      id: 1,
      from: "team",
      body: "Hi Neha! We’ve missed seeing you at Pulse Fitness. How have things been?",
      time: "10:24 AM",
      read: true,
    },
    {
      id: 2,
      from: "member",
      body: "Hi Priya, work has been quite hectic lately, so I haven’t managed to make it in.",
      time: "10:31 AM",
    },
    {
      id: 3,
      from: "team",
      body: "Totally understand. We have a new 45-minute evening strength class that might fit your schedule. I can reserve a spot for you next week.",
      time: "10:34 AM",
      read: true,
    },
    {
      id: 4,
      from: "member",
      body: "That sounds good. What days is it available?",
      time: "10:36 AM",
    },
    {
      id: 5,
      from: "team",
      body: "Monday, Wednesday and Friday at 7 PM. Would you like me to book Monday?",
      time: "10:38 AM",
      read: true,
    },
    { id: 6, from: "member", body: "Yes, I can come in on Monday evening.", time: "10:40 AM" },
  ],
  aarav: [
    {
      id: 1,
      from: "team",
      body: "Hi Aarav, just checking in — we haven’t seen you for a couple of weeks. Is everything okay?",
      time: "9:12 AM",
      read: true,
    },
    {
      id: 2,
      from: "member",
      body: "Thanks for checking in. I have been travelling. I should be back next week.",
      time: "9:24 AM",
    },
  ],
  kabir: [
    {
      id: 1,
      from: "member",
      body: "Hi! I just joined this morning. Could you share the weekend class schedule?",
      time: "8:42 AM",
    },
  ],
  ishita: [
    {
      id: 1,
      from: "team",
      body: "Your yoga class is confirmed for tomorrow at 8 AM.",
      time: "Yesterday",
      read: true,
    },
    { id: 2, from: "member", body: "Perfect, thank you!", time: "Yesterday" },
  ],
  rohan: [
    {
      id: 1,
      from: "team",
      body: "Hi Rohan, your latest membership payment didn’t go through. Would you like a fresh payment link?",
      time: "Yesterday",
      read: true,
    },
    { id: 2, from: "member", body: "I will update my card this evening.", time: "Yesterday" },
  ],
  ananya: [{ id: 1, from: "member", body: "Loved today’s mobility class!", time: "Yesterday" }],
  rahul: [
    { id: 1, from: "team", body: "Payment received. Thank you.", time: "Friday", read: true },
  ],
};

const campaigns = [
  {
    name: "August renewal reminder",
    audience: "82 members",
    channel: "WhatsApp + SMS",
    sent: "6 Aug",
    delivery: "96.3%",
    replies: "18",
  },
  {
    name: "We miss you — 14 day win-back",
    audience: "34 members",
    channel: "WhatsApp",
    sent: "3 Aug",
    delivery: "91.2%",
    replies: "12",
  },
  {
    name: "Saturday mobility workshop",
    audience: "146 members",
    channel: "WhatsApp",
    sent: "1 Aug",
    delivery: "98.6%",
    replies: "27",
  },
];

const templates = [
  {
    title: "Friendly check-in",
    category: "Retention",
    body: "Hi {{first_name}}, we’ve missed seeing you at {{gym_name}}. How have you been?",
    uses: 48,
  },
  {
    title: "Payment reminder",
    category: "Payments",
    body: "Hi {{first_name}}, your membership payment is due. Here’s a secure link to update it.",
    uses: 31,
  },
  {
    title: "Class confirmation",
    category: "Bookings",
    body: "You’re booked for {{class_name}} on {{date}} at {{time}}. See you there!",
    uses: 76,
  },
  {
    title: "Renewal coming up",
    category: "Renewals",
    body: "Your {{plan_name}} membership renews on {{renewal_date}}. Reply if we can help with anything.",
    uses: 22,
  },
];

type NavItem = {
  label: string;
  icon: typeof Users;
  href?: string;
  active?: boolean;
  badge?: string;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", icon: LayoutDashboard, href: "/" },
      { label: "Members", icon: Users, href: "/members" },
      { label: "Attendance", icon: Activity, href: "/attendance" },
      { label: "Payments", icon: WalletCards, href: "/payments" },
      { label: "Messages", icon: MessageCircle, href: "/messages", active: true, badge: "8" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Memberships", icon: CreditCard, href: "/memberships" },
      { label: "Trainers", icon: Dumbbell, href: "/trainers" },
      { label: "Reports", icon: BarChart3, href: "/reports" },
      { label: "Automations", icon: Zap, href: "/automations", badge: "NEW" },
    ],
  },
];

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <TrendingUp size={18} strokeWidth={2.8} />
      </div>
      <span>Gymwise</span>
    </div>
  );
}

function LegacySidebar({ open, close }: { open: boolean; close: () => void }) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={close} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button
            className="icon-button sidebar-close"
            onClick={close}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="location-switcher">
          <div className="location-icon">
            <Dumbbell size={17} />
          </div>
          <div>
            <strong>Pulse Fitness</strong>
            <span>South Delhi</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="main-nav" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(({ label, icon: Icon, href, active, badge }) => {
                const content = (
                  <>
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                    <span>{label}</span>
                    {badge && (
                      <span className={`nav-badge ${badge === "NEW" ? "new" : ""}`}>{badge}</span>
                    )}
                  </>
                );
                return href ? (
                  <Link
                    key={label}
                    href={href}
                    onClick={close}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <button key={label} className="nav-item" onClick={close}>
                    {content}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="insight-card">
            <div className="insight-icon">
              <Sparkles size={16} />
            </div>
            <strong>Messaging tip</strong>
            <p>Personal check-ins get 2.4× more replies.</p>
            <button>See best practices</button>
          </div>
          <button className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              window.open(
                "https://mail.google.com/mail/?view=cm&fs=1&to=support%40gecco.in",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <CircleHelp size={18} />
            <span>Help & support</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("gymwise-theme", next ? "dark" : "light");
  }
  return (
    <button
      className="icon-button theme-button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <Sun className="theme-sun" size={18} />
      <Moon className="theme-moon" size={18} />
    </button>
  );
}

function Header({ onMenu, notify }: { onMenu: () => void; notify: (message: string) => void }) {
  const { session, loading } = useSession();
  const name = session?.user.fullName ?? (loading ? "Loading…" : "Account");
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={20} />
        </button>
        <div className="mobile-brand">
          <Brand />
        </div>
      </div>
      <div className="topbar-actions">
        <ThemeToggle />
        <div className="topbar-divider" />
        <ProfileMenu
          name={name}
          initials={session ? getInitials(name) : "…"}
          role={session?.activeGym.role ?? ""}
          onNotify={notify}
        />
      </div>
    </header>
  );
}

function Inbox({ showToast }: { showToast: (message: string) => void }) {
  const [filter, setFilter] = useState<InboxFilter>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("neha");
  const [threads, setThreads] = useState(initialThreads);
  const [draft, setDraft] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const selected = conversations.find((item) => item.id === selectedId) ?? conversations[0];
  const visibleConversations = useMemo(
    () =>
      conversations.filter((item) => {
        const matchesFilter = filter === "All" || item.unread > 0;
        return (
          matchesFilter &&
          `${item.name} ${item.preview}`.toLowerCase().includes(query.trim().toLowerCase())
        );
      }),
    [filter, query],
  );

  function sendMessage() {
    const body = draft.trim();
    if (!body) return;
    setThreads((current) => ({
      ...current,
      [selectedId]: [
        ...(current[selectedId] ?? []),
        { id: Date.now(), from: "team", body, time: "Just now", read: false },
      ],
    }));
    setDraft("");
    setShowReplies(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className={`messages-workspace ${mobileChatOpen ? "mobile-chat-open" : ""}`}>
      <aside className="conversation-pane" aria-label="Conversations">
        <div className="conversation-top">
          <div>
            <strong>Conversations</strong>
            <span>8 unread messages</span>
          </div>
          <button className="icon-button small" aria-label="Conversation options">
            <MoreHorizontal size={17} />
          </button>
        </div>
        <div className="inbox-filters">
          <div className="inbox-filter-tabs">
            {(["All", "Unread"] as InboxFilter[]).map((item) => (
              <button
                key={item}
                className={filter === item ? "selected" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
                {item === "Unread" && <span>8</span>}
              </button>
            ))}
          </div>
          <label className="conversation-search">
            <Search size={15} />
            <input
              aria-label="Search conversations"
              placeholder="Search conversations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </label>
        </div>
        <div className="conversation-list">
          {visibleConversations.map((item) => (
            <button
              key={item.id}
              className={`conversation-item ${item.id === selectedId ? "selected" : ""}`}
              onClick={() => {
                setSelectedId(item.id);
                setMobileChatOpen(true);
              }}
            >
              <span className={`avatar ${item.color}`}>
                {item.initials}
                {item.online && <i className="online-dot" />}
              </span>
              <span className="conversation-copy">
                <span className="conversation-name">
                  <strong>{item.name}</strong>
                  <time>{item.time}</time>
                </span>
                <span className="conversation-preview">
                  <span>{item.preview}</span>
                  {item.unread > 0 && <b>{item.unread}</b>}
                </span>
                <small>{item.channel}</small>
              </span>
            </button>
          ))}
          {visibleConversations.length === 0 && (
            <div className="conversation-empty">
              <MessageCircle size={22} />
              <strong>No conversations found</strong>
              <span>Try a different name or filter.</span>
            </div>
          )}
        </div>
      </aside>

      <article className="message-pane">
        <header className="chat-header">
          <button
            className="icon-button small mobile-chat-back"
            onClick={() => setMobileChatOpen(false)}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </button>
          <span className={`avatar ${selected.color}`}>
            {selected.initials}
            {selected.online && <i className="online-dot" />}
          </span>
          <div className="chat-person">
            <strong>{selected.name}</strong>
            <span>
              {selected.online ? "Online now" : "Usually replies within an hour"} ·{" "}
              {selected.channel}
            </span>
          </div>
          <div className="chat-actions">
            <button
              className="icon-button small"
              aria-label={`Call ${selected.name}`}
              onClick={() => showToast(`Calling ${selected.name}`)}
            >
              <Phone size={16} />
            </button>
            <button
              className="icon-button small"
              aria-label="Archive conversation"
              onClick={() => showToast("Conversation archived")}
            >
              <Archive size={16} />
            </button>
            <button className="icon-button small" aria-label="More actions">
              <MoreHorizontal size={17} />
            </button>
          </div>
        </header>
        <div className="thread" aria-live="polite">
          <div className="date-divider">
            <span>Today</span>
          </div>
          {(threads[selectedId] ?? []).map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.from === "team" ? "outgoing" : "incoming"}`}
            >
              {message.from === "member" && (
                <span className={`avatar tiny ${selected.color}`}>{selected.initials}</span>
              )}
              <div>
                <div className="message-bubble">{message.body}</div>
                <span className="message-meta">
                  {message.time}
                  {message.from === "team" &&
                    (message.read ? <CheckCheck size={13} /> : <Check size={13} />)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="composer-wrap">
          {showReplies && (
            <div className="quick-replies">
              <button
                onClick={() => {
                  setDraft("Great — I’ve reserved your spot. See you then!");
                  setShowReplies(false);
                }}
              >
                Confirm booking
              </button>
              <button
                onClick={() => {
                  setDraft("Thanks for letting us know. Is there anything we can help with?");
                  setShowReplies(false);
                }}
              >
                Check in
              </button>
              <button
                onClick={() => {
                  setDraft("I’ll send that information over right away.");
                  setShowReplies(false);
                }}
              >
                Send information
              </button>
            </div>
          )}
          <div className="composer">
            <textarea
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${selected.name.split(" ")[0]}...`}
              aria-label={`Message ${selected.name}`}
            />
            <div className="composer-tools">
              <div>
                <button
                  className="icon-button small"
                  aria-label="Attach file"
                  onClick={() => showToast("Choose a file to attach")}
                >
                  <Paperclip size={16} />
                </button>
                <button
                  className={`icon-button small ${showReplies ? "active" : ""}`}
                  aria-label="Use a quick reply"
                  onClick={() => setShowReplies((value) => !value)}
                >
                  <FileText size={16} />
                </button>
              </div>
              <span>Press Enter to send</span>
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!draft.trim()}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <div className="secure-note">
            <Check size={12} /> Messages are sent securely via {selected.channel}
          </div>
        </div>
      </article>

      <aside className="member-pane">
        <div className="member-summary">
          <span className={`avatar large ${selected.color}`}>
            {selected.initials}
            {selected.online && <i className="online-dot" />}
          </span>
          <strong>{selected.name}</strong>
          <span>{selected.phone}</span>
          <div className={`member-status ${selected.status.toLowerCase().replace(" ", "-")}`}>
            {selected.status}
          </div>
        </div>
        <div className="member-detail-section">
          <div className="detail-heading">
            <strong>Member details</strong>
            <button onClick={() => showToast(`${selected.name} profile opened`)}>
              View profile
            </button>
          </div>
          <dl>
            <div>
              <dt>Membership</dt>
              <dd>{selected.plan}</dd>
            </div>
            <div>
              <dt>Renewal</dt>
              <dd>{selected.renewal}</dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{selected.joined}</dd>
            </div>
            <div>
              <dt>Attendance</dt>
              <dd>{selected.visits}</dd>
            </div>
          </dl>
        </div>
        <div className="member-detail-section">
          <div className="detail-heading">
            <strong>Conversation</strong>
          </div>
          <dl>
            <div>
              <dt>Owner</dt>
              <dd>
                <span className="avatar micro avatar-main">PK</span>Priya Khanna
              </dd>
            </div>
            <div>
              <dt>Channel</dt>
              <dd>{selected.channel}</dd>
            </div>
          </dl>
        </div>
        <div className="member-detail-section">
          <div className="detail-heading">
            <strong>Tags</strong>
            <button aria-label="Add tag">
              <Plus size={14} />
            </button>
          </div>
          <div className="member-tags">
            <span>
              <Tag size={11} /> {selected.status}
            </span>
            <span>South Delhi</span>
          </div>
        </div>
      </aside>
    </section>
  );
}

function Campaigns({ showToast }: { showToast: (message: string) => void }) {
  return (
    <section className="messages-secondary">
      <div className="secondary-summary">
        <div>
          <span>Messages sent this month</span>
          <strong>1,248</strong>
          <small>+18% from last month</small>
        </div>
        <div>
          <span>Delivery rate</span>
          <strong>96.8%</strong>
          <small>Across all channels</small>
        </div>
        <div>
          <span>Reply rate</span>
          <strong>14.2%</strong>
          <small>177 member replies</small>
        </div>
      </div>
      <div className="campaign-panel">
        <div className="campaign-panel-header">
          <div>
            <h2>Recent campaigns</h2>
            <p>Track scheduled and completed member outreach.</p>
          </div>
          <button
            className="button secondary"
            onClick={() => showToast("Campaign report exported")}
          >
            Export report
          </button>
        </div>
        <div className="campaign-table-wrap">
          <table className="campaign-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Audience</th>
                <th>Channel</th>
                <th>Sent</th>
                <th>Delivery</th>
                <th>Replies</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((item) => (
                <tr key={item.name}>
                  <td>
                    <span className="campaign-icon">
                      <Send size={15} />
                    </span>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.audience}</td>
                  <td>{item.channel}</td>
                  <td>{item.sent}</td>
                  <td>
                    <span className="delivery-rate">{item.delivery}</span>
                  </td>
                  <td>{item.replies}</td>
                  <td>
                    <button className="icon-button small">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Templates({ showToast }: { showToast: (message: string) => void }) {
  return (
    <section className="template-grid">
      {templates.map((template) => (
        <article className="template-card" key={template.title}>
          <div className="template-card-top">
            <span className="template-icon">
              <FileText size={17} />
            </span>
            <button className="icon-button small">
              <MoreHorizontal size={17} />
            </button>
          </div>
          <span className="template-category">{template.category}</span>
          <h2>{template.title}</h2>
          <p>{template.body}</p>
          <div>
            <span>Used {template.uses} times</span>
            <button onClick={() => showToast(`“${template.title}” opened`)}>Use template</button>
          </div>
        </article>
      ))}
    </section>
  );
}

function NewMessageModal({
  close,
  showToast,
}: {
  close: () => void;
  showToast: (message: string) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    close();
    showToast("Message sent successfully");
  }
  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-message-title"
      onMouseDown={(event) => event.currentTarget === event.target && close()}
    >
      <form className="modal new-message-modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <h2 id="new-message-title">New message</h2>
            <p>Start a conversation with a member.</p>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <label>
          Member
          <select required defaultValue="">
            <option value="" disabled>
              Select a member
            </option>
            {conversations.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label>
          Channel
          <select defaultValue="WhatsApp">
            <option>WhatsApp</option>
            <option>SMS</option>
          </select>
        </label>
        <label>
          Message
          <textarea required autoFocus rows={5} placeholder="Write your message..." />
        </label>
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={close}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            <Send size={15} /> Send message
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MessagesPage() {
  const [view, setView] = useState<View>("Inbox");
  const [mobileNav, setMobileNav] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [toast, setToast] = useState("");
  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }
  return (
    <div className="app-shell">
      <DashboardSidebar open={mobileNav} onClose={() => setMobileNav(false)} onNotify={showToast} />
      <div className="app-content messages-app-content">
        <Header onMenu={() => setMobileNav(true)} notify={showToast} />
        <main className="messages-page">
          <div className="messages-heading">
            <div>
              <h1>Messages</h1>
              <p>Connect with members and keep every conversation in one place.</p>
            </div>
            <button className="button primary" onClick={() => setShowNewMessage(true)}>
              <Plus size={16} /> New message
            </button>
          </div>
          <div className="messages-tabs" role="tablist">
            {(["Inbox", "Campaigns", "Templates"] as View[]).map((item) => (
              <button
                role="tab"
                aria-selected={view === item}
                className={view === item ? "selected" : ""}
                key={item}
                onClick={() => setView(item)}
              >
                {item}
                {item === "Inbox" && <span>8</span>}
              </button>
            ))}
          </div>
          {view === "Inbox" && <Inbox showToast={showToast} />}
          {view === "Campaigns" && <Campaigns showToast={showToast} />}
          {view === "Templates" && <Templates showToast={showToast} />}
        </main>
      </div>
      <MobileNavigation onNotify={showToast} onAdd={() => setShowNewMessage(true)} />
      {showNewMessage && (
        <NewMessageModal close={() => setShowNewMessage(false)} showToast={showToast} />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={15} />
          </span>
          {toast}
        </div>
      )}
    </div>
  );
}
