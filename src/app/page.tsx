import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, GitBranch, Bot, ArrowRight, Play, Code2, Workflow } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 glass rounded-2xl">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Agentify
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" className="hover:bg-white/5 cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="gradient-bg glow hover:opacity-90 transition-all cursor-pointer">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-40 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-muted-foreground">Build AI Agents Without Code</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Create Intelligent
            <span className="block gradient-text py-2">
              AI Agents
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            Design, build, and deploy custom AI agents using our intuitive drag-and-drop
            interface. Connect to any LLM and automate complex workflows in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gradient-bg glow hover:opacity-90 text-lg px-8 h-14 cursor-pointer group">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 glass border-white/10 hover:bg-white/5 cursor-pointer">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
          <div className="relative rounded-2xl gradient-border overflow-hidden">
            <div className="glass-card p-8 min-h-[450px] flex items-center justify-center">
              {/* Mock Agent Builder UI */}
              <div className="w-full grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                  <div className="glass rounded-xl p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Nodes</h4>
                    {[
                      { icon: Play, label: "Start", color: "from-emerald-500 to-emerald-600" },
                      { icon: Bot, label: "AI Model", color: "from-violet-500 to-pink-500" },
                      { icon: Code2, label: "Code", color: "from-slate-600 to-slate-700" },
                    ].map((node, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center`}>
                          <node.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm">{node.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-center">
                  <div className="flex items-center gap-4">
                    {/* Flow visualization */}
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-32 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                        <span className="text-sm text-emerald-400">Start</span>
                      </div>
                      <div className="h-8 w-0.5 bg-gradient-to-b from-emerald-500/50 to-violet-500/50" />
                    </div>
                    <div className="flex flex-col items-center -mt-8">
                      <div className="h-8 w-0.5 bg-gradient-to-b from-transparent to-violet-500/50" />
                      <div className="h-20 w-40 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center animate-pulse-glow">
                        <div className="text-center">
                          <Bot className="h-5 w-5 mx-auto mb-1 text-violet-400" />
                          <span className="text-sm text-violet-300">GPT-4</span>
                        </div>
                      </div>
                      <div className="h-8 w-0.5 bg-gradient-to-b from-pink-500/50 to-red-500/50" />
                    </div>
                    <div className="flex flex-col items-center mt-8">
                      <div className="h-8 w-0.5 bg-gradient-to-b from-red-500/50 to-transparent" />
                      <div className="h-16 w-32 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 flex items-center justify-center">
                        <span className="text-sm text-red-400">End</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to Build
            <span className="gradient-text block mt-2">AI Agents</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed to make AI agent development accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Workflow,
              title: "Visual Flow Builder",
              description: "Drag and drop nodes to create complex agent workflows. No coding required.",
              gradient: "from-violet-500 to-pink-500",
            },
            {
              icon: Bot,
              title: "Multi-Provider AI",
              description: "Connect to OpenAI, Anthropic, Google, and more. Switch models instantly.",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Zap,
              title: "Real-time Execution",
              description: "Watch your agents run in real-time with detailed logging and streaming.",
              gradient: "from-orange-500 to-yellow-500",
            },
            {
              icon: Shield,
              title: "Enterprise Security",
              description: "Built-in rate limiting, bot protection, and API security powered by Arcjet.",
              gradient: "from-emerald-500 to-teal-500",
            },
            {
              icon: Code2,
              title: "Smart Nodes",
              description: "Pre-built nodes for AI, APIs, conditions, loops, and custom code.",
              gradient: "from-rose-500 to-pink-500",
            },
            {
              icon: ArrowRight,
              title: "Deploy Anywhere",
              description: "Export your agents or run them directly from our cloud infrastructure.",
              gradient: "from-indigo-500 to-violet-500",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative glass-card rounded-2xl p-6 hover:border-violet-500/30 hover-lift cursor-pointer"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur-3xl" />
          <div className="relative glass-card rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative">
              Ready to Build Your
              <span className="gradient-text block mt-2">First Agent?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10 relative">
              Join thousands of developers and businesses automating their workflows with AI agents.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gradient-bg glow-lg hover:opacity-90 text-lg px-10 h-14 cursor-pointer group relative">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Agentify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Agentify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
