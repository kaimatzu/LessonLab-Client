// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import { Message } from '@/lib/types/workspace-types';
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import Artifact from '@/components/ui/ui-base/artifact'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/ui-composite/chat/codeblock'
import { MemoizedReactMarkdown } from '@/components/ui/ui-base/markdown'
import { IconPinecone, IconUser } from '@/components/ui/ui-base/icons'

import AnnouncementIcon from '@mui/icons-material/Announcement';
import InfoIcon from '@mui/icons-material/Info';

import { ChatMessageActions } from '@/components/workspace/chat/chat-message-actions'
import { Components } from '@/lib/types/artifact-types'

import React from 'react'
import ModuleOutlineCard from '@/components/ui/ui-base/directives/module-outline-card'
import ModuleOutlineGenerationConfirmCard from '@/components/ui/ui-base/directives/module-outline-generation-confirm-card'
import ActionNotificationCard from '@/components/ui/ui-base/directives/action-notification-card'
import RAGEmptyContextNotification from '@/components/ui/ui-base/directives/rag-empty-context-notification';

const iconMap = new Map([
  ['user', new Map([
    ['standard', <IconUser className="size-6 text-black dark:text-zinc-100" />],
    ['action', <InfoIcon sx={{ fontSize: '1.5rem', color: '#9AADEC', backgroundColor: 'transparent' }} />],
  ])],
  ['assistant', new Map([
    ['standard', <IconPinecone className="size-6 text-primary-foreground" />],
    ['action', <AnnouncementIcon sx={{ fontSize: '1.5rem', color: '#9AADEC', backgroundColor: 'transparent' }} />],
  ])],
]);


export interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const renderIcon = () => {
    const roleIcons = iconMap.get(message.role);
    if (roleIcons) {
      return roleIcons.get(message.type) || null;
    }
    return null;
  };
  
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'group relative mb-6 flex items-start',
        isUser ? 'justify-end' : 'justify-start'
      )}
      {...props}
    >
      {!isUser && (
        <div className="mr-2 flex items-center justify-center size-6 shrink-0 select-none rounded-md text-primary-foreground">
          {renderIcon()}
        </div>
      )}

      {/* Chat bubble */}
      <div
        className={cn(
          'max-w-[70%] p-3 rounded-lg border',
          isUser ? 'bg-[#DCE3FA] border-[#5E77D3] text-[#5E77D3] rounded-br-none' : 'bg-white border-gray-300 text-black rounded-bl-none'
        )}
      >
        <MemoizedReactMarkdown
          className="prose break-words prose-p:leading-relaxed prose-pre:p-0 text-black dark:text-zinc-100"
          remarkPlugins={[remarkGfm, remarkMath, remarkDirective, remarkDirectiveRehype]}
          rehypePlugins={[]}
          skipHtml={false}
          components={{
            p(props: any) {
              const { children } = props;
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
            'artifact': (props: any) => {
              const { name, children } = props;

              // Render Artifact component only if the message is from the assistant or is an action message
              if (message.role === 'assistant' || message.type === 'action') {
                return <Artifact name={name} children={children} message={message.content} />;
              }

              // Otherwise, render the message content as a paragraph
              return <p className="mb-0 last:mb-0">{message.content}</p>;
            },

            'action_notification': (props: any) => {
              const { actionMessage } = props;

              // Render ActionNotificationCard only if the message is from the assistant or is an action message
              if (message.role === 'assistant' || message.type === 'action') {
                return <ActionNotificationCard actionMessage={actionMessage} />;
              }

              // Otherwise, render the message content as a paragraph
              return <p className="mb-0 last:mb-0">{message.content}</p>;
            },

            'rag_empty_context_notification': (props: any) => {
              const { notificationMessage } = props;

              // Render ActionNotificationCard only if the message is from the assistant or is an action message
              if (message.role === 'assistant' || message.type === 'action') {
                return <RAGEmptyContextNotification notificationMessage={notificationMessage} />;
              }

              // Otherwise, render the message content as a paragraph
              return <p className="mb-0 last:mb-0">{message.content}</p>;
            },

            'module_outline_generation_confirm': (props: any) => {
              const { subject, context_instructions } = props;

              // Render ModuleOutlineGenerationConfirmCard only if the message is from the assistant or is an action message
              if (message.role === 'assistant' || message.type === 'action') {
                return <ModuleOutlineGenerationConfirmCard assistantMessageId={message.id} subject={subject} context_instructions={context_instructions} />;
              }

              // Otherwise, render the message content as a paragraph
              return <p className="mb-0 last:mb-0">{message.content}</p>;
            },

            'module_outline': (props: any) => {
              const { moduleId, subject, context_instructions, children } = props;
              
              console.log("Module outline raw message:", message.content);
              console.log("Params:", moduleId, subject, context_instructions)
              // Render ModuleOutlineCard only if the message is from the assistant or is an action message
              if (message.role === 'assistant' || message.type === 'action') {
                return <ModuleOutlineCard moduleId={moduleId} assistantMessageId={message.id} subject={subject} context_instructions={context_instructions} children={children} />;
              }

              // Otherwise, render the message content as a paragraph
              return <p className="mb-0 last:mb-0">{message.content}</p>;
            },

          } as Components}
        >
          {message.content}
        </MemoizedReactMarkdown>
        <ChatMessageActions message={message} />
      </div>
    </div>
  )
}
