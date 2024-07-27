// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from 'ai'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import Artifact from '@/components/ui/ui-base/artifact'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/ui-composite/codeblock'
import { MemoizedReactMarkdown } from '@/components/ui/ui-base/markdown'
import { IconPinecone, IconUser } from '@/components/ui/ui-base/icons'
import { ChatMessageActions } from '@/components/material/chat/chat-message-actions'
import { Components } from '@/lib/types/artifact-type'

import React from 'react'

export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-4 flex items-start py-5')}
      {...props}
    >
      <div
        className={cn(
          'flex size-6 shrink-0 select-none items-center justify-center rounded-md',
          message.role === 'user'
            ? 'bg-background '
            : 'bg-primary text-primary-foreground'
        )}
      >
        {message.role === 'user' ? <IconUser className='size-6 text-black dark:text-zinc-100' /> : <IconPinecone />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-visible">
        <MemoizedReactMarkdown
          className="prose break-words prose-p:leading-relaxed prose-pre:p-0 text-black dark:text-zinc-100"
          remarkPlugins={[remarkGfm, remarkMath, remarkDirective, remarkDirectiveRehype]}
          rehypePlugins={[]}
          skipHtml={false}
          components={{
            p(props: any) {
              const { children } = props;
              console.log("Creating p tag...");
              return <p className="mb-0 last:mb-0">{children}</p>
            },
            li(props: any) {
              const { children } = props;
              return <li className="max-h-fit ml-3 mb-3 max-w-2xl">{children}</li>
            },
            ul(props: any) {
              const { children } = props;
              return <ul className="!list-disc max-h-fit !whitespace-normal">{children}</ul>
            },
            ol(props: any) {
              const { children } = props;
              return <ol className="!list-decimal max-h-fit !whitespace-normal">{children}</ol>
            },
            a(props: any) {
              const { node, className, children, ...rest } = props;
              return (
                <a
                  className="text-blue-600 dark:text-zinc-600 hover:underline font-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...rest}
                >
                  {children}
                </a>
              )
            },        
            code(props: any) {
              const { node, inline, className, children, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...rest}
                />
              )
            },
            
            // Directives for Rendering Components           
            'artifact': Artifact

          } as Components}
        >
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
