// artifact-type.d.ts
import { ComponentType, ComponentPropsWithoutRef, ReactNode } from 'react'
import { Components as ReactMarkdownComponents, ReactMarkdownProps as OriginalReactMarkdownProps } from 'react-markdown'
import { Element } from 'hast'

export type ReactMarkdownNames = keyof JSX.IntrinsicElements

export type ReactMarkdownProps = OriginalReactMarkdownProps & {
  node: Element;
  children: React.ReactNode[];
  sourcePosition?: Position;
  index?: number;
  siblingCount?: number;
}

export type ArtifactProps = ComponentPropsWithoutRef<'div'> &
  ReactMarkdownProps & {
    name: string
  }


export type ArtifactComponent = ComponentType<ArtifactProps>

export type CustomComponents = {
  artifact: ArtifactComponent | ReactMarkdownNames
}

export type Components = Partial<
  Omit<ReactMarkdownComponents, keyof CustomComponents> & CustomComponents
>
