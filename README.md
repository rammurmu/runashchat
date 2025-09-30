<a href="https://mcp.scira.ai">
  <h1 align="center">RunAshChat</h1>
</a>

<p align="center">
  An open-source AI chatbot app, powered by the Model Context Protocol (MCP). Built with Next.js and the AI SDK by Vercel, RunAshChat brings seamless conversational AI to your workflow.
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/rammurmu/runash-mcp-chat" alt="License">
  <img src="https://img.shields.io/github/issues/rammurmu/runash-mcp-chat" alt="Issues">
  <img src="https://img.shields.io/github/stars/rammurmu/runash-mcp-chat" alt="Stars">
</p>

---

## 🚀 Features

- **Conversational AI**: Engage with advanced AI chat capabilities.
- **Model Context Protocol (MCP) Integration**: Leverage the power of MCP for enhanced context management.
- **Next.js Powered**: Fast, scalable, and production-ready web app framework.
- **Vercel AI SDK**: Utilize Vercel's AI SDK for robust and efficient AI operations.
- **Open Source**: Freely available for the community to use, modify, and contribute.

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rammurmu/runash-mcp-chat.git
   cd runash-mcp-chat
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required values.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## 📦 Usage

- Access the web app via your browser.
- Start chatting with the AI bot.
- Customize or extend prompts and models as needed.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

Read our [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 📬 Contact

- **Author:** [rammurmu](https://github.com/rammurmu)
- **Project URL:** [https://github.com/rammurmu/runash-mcp-chat](https://github.com/rammurmu/runash-mcp-chat)

---

> Built with ❤️ by the RunAsh Community and contributors.

## 📸 Screenshots

<p align="center">
  <img src="docs/screenshot.png" alt="RunAshChat Demo Screenshot" width="700"/>
</p>


## 📦 Usage Examples

### 1. Start a Conversation

Once the app is running locally or deployed, open your browser and navigate to [http://localhost:3000](http://localhost:3000):

1. Type your message in the chat input at the bottom.
2. Press **Enter** or click the **Send** button.
3. The AI will respond contextually, leveraging the Model Context Protocol (MCP).

**Example**
```
User: How can I integrate RunAshChat with my own AI model?
AI: You can update the configuration in `mcp.config.js` to point to your model endpoint. For more details, visit our docs at [link].
```

---

### 2. Context Awareness

RunAshChat remembers previous messages in the session, allowing for coherent multi-turn conversations.

**Example:**
```
User: Summarize the previous answer.
AI: Here’s a concise summary of how to integrate your own AI model with RunAshChat...
```

---

### 3. Custom Prompting

You can customize prompts for different use-cases, such as coding help, research, or creative writing.

**Example:**
```
User: Act as a Python tutor. How do I write a for loop?
AI: Sure! In Python, a simple for loop looks like this:
for i in range(5):
    print(i)
```

---

## 🧩 Customization

- **Change Default Model:**  
  Edit the `mcp.config.js` file to set your preferred AI model or backend endpoint.
- **UI Theming:**  
  Update styles in `styles/` to match your branding or color scheme.
- **Add Plugins:**  
  Extend functionality by adding plugins in the `plugins/` directory.

---

## 🙋 Need Help?

- **Documentation:** See [docs/](docs/) for detailed guides.
- **Issues:** Report bugs or request features on the [GitHub Issues page](https://github.com/rammurmu/runash-mcp-chat/issues).
- **Community:** Join the discussion in [GitHub Discussions](https://github.com/rammurmu/runash-mcp-chat/discussions).

---
