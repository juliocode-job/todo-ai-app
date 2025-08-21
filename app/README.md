# AI-Enhanced Todo Application

A full-stack, multi-channel todo management system with AI-powered task enhancement and real-time synchronization.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon system
- **React Hot Toast** - Notification system

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **Supabase** - PostgreSQL database with real-time subscriptions
- **OpenAI GPT-3.5** - AI task enhancement and smart suggestions
- **Edge Functions** - Serverless compute on Vercel

### Integrations
- **n8n** - Workflow automation and API orchestration
- **Evolution API** - WhatsApp Business API integration
- **Typebot** - Conversational chatbot interface
- **Vercel** - Deployment and hosting with automatic CI/CD

## ✨ Features

- 🤖 **AI Enhancement** - Automatic task enrichment with actionable steps
- 💬 **Multi-Channel Access** - Web, WhatsApp, and chatbot interfaces
- 🔄 **Real-Time Sync** - Instant updates across all platforms
- 👥 **Multi-User Support** - Session-based user management
- 📱 **WhatsApp Bot** - Complete todo management via WhatsApp
- 🔐 **Persistent Storage** - PostgreSQL with RLS policies
- 📊 **RESTful API** - Full CRUD operations
- 🎨 **Responsive Design** - Mobile-first approach

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (optional)
- Docker (for WhatsApp integration)

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/todo-ai-app.git
cd todo-ai-app
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your credentials
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

## 🔗 API Endpoints

- \`GET /api/todos?user_identifier={email}\` - List todos
- \`POST /api/todos\` - Create todo
- \`PATCH /api/todos/{id}\` - Update todo
- \`DELETE /api/todos/{id}\` - Delete todo

## 📱 WhatsApp Commands

Send \`#todolist\` to the bot number to start, then:
- \`1\` or \`list\` - View todos
- \`2\` or \`add\` - Create todo
- \`3\` or \`complete\` - Mark as done
- \`4\` or \`delete\` - Remove todo
- \`5\` or \`logout\` - End session

## 🚀 Deployment

Deployed on Vercel with automatic CI/CD from main branch.

## 📄 License

MIT

## 👨‍💻 Author

Júlio França