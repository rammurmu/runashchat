<div align="center">
<a href="[https://chat.runash.in](https://chat.runash.in)">
<img src="public/logo.png" alt="RunAshChat Logo" width="80" height="80" />
</a>
<h1 align="center">RunAshChat</h1>
<p align="center">
<strong>The Open-Source Gateway to Local & Cloud Intelligence</strong>
</p>
<p align="center">
RunAshChat is a high-performance AI chat interface powered by <b>Model Context Protocol (MCP)</b>, built with <b>Next.js</b> and the <b>Vercel AI SDK</b>.
</p>

<p align="center">
<a href="[https://chat.runash.in](https://chat.runash.in)"><strong>Live Demo</strong></a> •
<a href="#-features"><strong>Features</strong></a> •
<a href="#-mcp-server-configuration"><strong>MCP Setup</strong></a> •
<a href="#-quick-start"><strong>Quick Start</strong></a>
</p>
</div>

---

## ✨ Features

* **Streaming & Versatile:** Real-time text streaming using the [Vercel AI SDK](https://sdk.vercel.ai/docs), supporting multiple LLM providers.
* **MCP First:** Deep integration with [Model Context Protocol (MCP)](https://modelcontextprotocol.io) to give your AI access to local files, databases, or APIs.
* **Dual-Transport Support:** Connect to remote tool providers via **HTTP** or **SSE (Server-Sent Events)**.
* **Reasoning-Ready:** Full support for "Chain of Thought" models (like DeepSeek-R1 or O1) with UI-optimized thinking blocks.
* **Modern UI/UX:** A sleek, responsive interface built with [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com).
* **Edge Optimized:** Leverages the Next.js App Router for maximum performance.

---

## 🛠 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org) |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/docs) |
| **Protocol** | [Model Context Protocol (MCP)](https://modelcontextprotocol.io) |
| **Styling** | Tailwind CSS + Lucide Icons |
| **Components** | shadcn/ui |

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/runashchat.git
cd runashchat

```

### 2. Install dependencies

```bash
npm install

```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
# Add other providers as needed

```

### 4. Run Development Server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to see the result.

---

## 🔌 MCP Server Configuration

RunAshChat allows you to dynamically extend the AI's capabilities by adding MCP servers directly through the UI.

### Adding a Server

1. **Open Settings:** Click the ⚙️ icon next to the model selector.
2. **Server Details:** Enter a friendly name for the server.
3. **Transport Type:** * **HTTP:** Best for stateless remote toolkits.
* **SSE:** Recommended for long-lived connections and streaming tool responses.


4. **Connect:** Enter the endpoint URL and click **Add Server**.

> [!TIP]
> **Popular MCP Servers to try:**
> * [Composio](https://composio.dev/mcp) (Tools & Integrations)
> * [Zapier Central](https://zapier.com/mcp) (Workflow Automation)
> * [Hugging Face](https://huggingface.co/mcp) (Model Discovery)
> 
> 

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](https://www.google.com/search?q=LICENSE) file for more details.

---

<p align="center">
Built with ❤️ by the RunAsh community.
</p>

---

### What I changed/added:

* **Visual Elements:** Added a placeholder for a logo and used badges/tables to make the "Tech Stack" easier to scan.
* **Admonitions:** Used GitHub's "Tip" syntax to highlight MCP server examples.
* **Quick Start:** Added the essential terminal commands that developers look for immediately.
* **Modern Branding:** Updated the tagline to be more punchy and descriptive.

**Would you like me to help you draft a `CONTRIBUTING.md` file or generate a specific `LICENSE` file for this project?**
