'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/components/ui/use-toast'
import {
    Send,
    Loader2,
    Sparkles,
    User,
    Bot,
    Plus,
    BarChart3,
    Zap,
    Inbox,
    CheckCircle2,
    Clock,
    Archive,
    AlertCircle,
} from 'lucide-react'
import { SUBMISSION_QUICK_ACTIONS } from '@/lib/ai/assistant'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface SubmissionStats {
    total: number
    new: number
    reviewed: number
    in_progress: number
    closed: number
    archived: number
    topIndustry: string | null
}

interface AiAssistantProps {
    userName: string
    userId: string
    systemContext: string
    stats: SubmissionStats
}

const QUICK_ACTION_ICONS: Record<string, any> = {
    'summarize-new': Inbox,
    'in-progress': Zap,
    'stats-overview': BarChart3,
    'industry-breakdown': Zap,
    'closed-analysis': CheckCircle2,
    'suggestions': Sparkles,
}

export function AiAssistant({ userName, userId, systemContext, stats }: AiAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollArea) {
                scrollArea.scrollTop = scrollArea.scrollHeight
            }
        }
    }, [messages, isLoading])

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({
                        role: m.role,
                        content: m.content,
                    })),
                    systemContext,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response')
            }

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error: any) {
            toast({
                title: 'AI Assistant Error',
                description: error.message || 'Failed to communicate with AI. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(inputValue)
    }

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto relative overflow-hidden rounded-3xl backdrop-blur-sm shadow-2xl">
            <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
                <ScrollArea ref={scrollRef} className="flex-1 px-4 md:px-6">
                    <div className="max-w-5xl mx-auto min-h-full flex flex-col">
                        <AnimatePresence mode="wait">
                            {messages.length === 0 ? (
                                <motion.div
                                    key="welcome"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center min-h-[500px] py-12 px-2"
                                >
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                                        className="relative mb-8"
                                    >
                                        <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse" />
                                        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl">
                                            <Bot className="h-10 w-10 text-white" />
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-center space-y-2 mb-10"
                                    >
                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                            Hello, {userName.split(' ')[0]}
                                        </h2>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                                            I've analyzed your {stats.total} recent submissions. Want a summary of the new ones or a breakdown of your top industries?
                                        </p>
                                        {stats.new > 0 && (
                                            <div className="inline-flex items-center gap-1.5 mt-4 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                                                <AlertCircle className="h-4 w-4" />
                                                {stats.new} New Priority Submissions
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
                                        {SUBMISSION_QUICK_ACTIONS.map((action, idx) => {
                                            const IconComp = QUICK_ACTION_ICONS[action.id] || Sparkles
                                            return (
                                                <motion.button
                                                    key={action.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 + idx * 0.05 }}
                                                    whileHover={{ y: -4, backgroundColor: 'hsl(var(--muted)/0.5)', borderColor: 'hsl(var(--primary)/0.4)' }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => sendMessage(action.prompt)}
                                                    className="group relative flex flex-col items-start gap-2.5 rounded-2xl border border-border bg-muted/20 p-4 text-left backdrop-blur-sm transition-all shadow-lg hover:shadow-primary/10"
                                                >
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                        <IconComp className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</span>
                                                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 group-hover:text-foreground/80">
                                                            {action.prompt}
                                                        </p>
                                                    </div>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-8 py-8">
                                    <AnimatePresence initial={false}>
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                                className={cn(
                                                    'flex w-full gap-4',
                                                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                                )}
                                            >
                                                <div className={cn(
                                                    'flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl overflow-hidden shadow-lg border border-border',
                                                    message.role === 'user' ? 'bg-muted/50' : 'bg-gradient-to-br from-primary to-primary/80'
                                                )}>
                                                    {message.role === 'user' ? (
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Bot className="h-5 w-5 text-white" />
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    'relative group flex flex-col gap-2 max-w-[85%] sm:max-w-[80%]',
                                                    message.role === 'user' ? 'items-end' : 'items-start'
                                                )}>
                                                    <div className={cn(
                                                        'px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all animate-in fade-in-0 zoom-in-95 duration-300',
                                                        message.role === 'user'
                                                            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20 font-medium'
                                                            : 'bg-card backdrop-blur-md border border-border/50 text-foreground rounded-tl-sm w-full'
                                                    )}>
                                                        {message.role === 'assistant' ? (
                                                            <div className={cn(
                                                                'prose prose-sm max-w-none prose-p:leading-relaxed',
                                                                'prose-pre:bg-muted prose-pre:border prose-pre:border-border/50',
                                                                'prose-code:text-primary dark:prose-code:text-primary-foreground',
                                                                'prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
                                                                'dark:prose-invert prose-headings:text-foreground prose-a:text-primary dark:prose-a:text-primary/80'
                                                            )}>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                    {message.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        ) : (
                                                            <p className="font-medium">{message.content}</p>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-medium px-2">
                                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {isLoading && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-4"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg border border-border">
                                                <Bot className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="px-5 py-4 rounded-2xl bg-muted/50 border border-border rounded-tl-sm flex items-center gap-3">
                                                    <div className="flex gap-1.5">
                                                        {[0, 0.2, 0.4].map((delay, i) => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                                                                transition={{ duration: 1, repeat: Infinity, delay }}
                                                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium tracking-tight">AI is thinking...</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </main>

            <footer className="relative z-20 px-6 pb-6 pt-4 backdrop-blur-md border-t border-border/30">
                <div className="max-w-4xl mx-auto">
                    <div className="relative p-1.5 rounded-2xl border border-border/50 bg-background/50 shadow-xl focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
                            <Input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about your leads, industries, or stats..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-sm"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className={cn(
                                    'h-10 w-10 p-0 rounded-xl transition-all shadow-lg',
                                    inputValue.trim()
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'bg-muted text-muted-foreground'
                                )}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <p className="text-[9px] text-muted-foreground tracking-widest font-bold opacity-60">
                            Context-Aware • Submission Insights • Secure AI
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
