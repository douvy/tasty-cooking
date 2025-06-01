import React from 'react';
import { MDXProvider as BaseMDXProvider } from '@mdx-js/react';

// Define custom MDX components with proper TypeScript types
interface ComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

const components = {
  h1: ({ children, ...props }: ComponentProps) => (
    <h1 className="text-3xl font-windsor-bold text-light-gray mt-8 mb-4" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }: ComponentProps) => (
    <h2 className="text-2xl font-windsor-bold text-light-gray mt-6 mb-3" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }: ComponentProps) => (
    <h3 className="text-xl font-windsor-bold text-light-gray mt-4 mb-2" {...props}>{children}</h3>
  ),
  p: ({ children, ...props }: ComponentProps) => (
    <p className="text-light-gray mb-4 leading-relaxed" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: ComponentProps) => (
    <ul className="list-disc pl-6 text-light-gray mb-4 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: ComponentProps) => (
    <ol className="list-decimal pl-6 text-light-gray mb-4 space-y-1" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: ComponentProps) => (
    <li className="text-light-gray" {...props}>{children}</li>
  ),
  a: ({ children, ...props }: ComponentProps) => (
    <a className="text-secondary hover:underline" {...props}>{children}</a>
  ),
  strong: ({ children, ...props }: ComponentProps) => (
    <strong className="text-secondary font-bold" {...props}>{children}</strong>
  ),
  blockquote: ({ children, ...props }: ComponentProps) => (
    <blockquote className="border-l-4 border-secondary pl-4 italic text-gray-400 my-4" {...props}>{children}</blockquote>
  ),
  code: ({ children, className, ...props }: ComponentProps) => {
    // Check if it's an inline code block
    if (typeof children === 'string') {
      return <code className="bg-[#222419] text-secondary px-1 py-0.5 rounded text-sm" {...props}>{children}</code>;
    }
    // If it's a code block with language
    return (
      <code className="block bg-[#1a1c14] p-4 rounded-md overflow-x-auto text-sm my-4" {...props}>
        {children}
      </code>
    );
  },
  img: ({ alt, ...props }: ComponentProps) => (
    <img 
      className="rounded-md my-6 max-w-full h-auto" 
      alt={alt || ""}  
      {...props} 
    />
  ),
  hr: () => <hr className="border-[#3a4228] my-8" />,
  table: ({ children, ...props }: ComponentProps) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full bg-[#222419] rounded-lg overflow-hidden" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: ComponentProps) => (
    <th className="px-4 py-2 text-left text-secondary font-bold border-b border-[#3a4228]" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentProps) => (
    <td className="px-4 py-2 border-t border-[#3a4228] text-light-gray" {...props}>
      {children}
    </td>
  ),
};

interface MDXProviderProps {
  children: React.ReactNode;
}

const MDXProvider: React.FC<MDXProviderProps> = ({ children }) => {
  return (
    <BaseMDXProvider components={components}>
      {children}
    </BaseMDXProvider>
  );
};

export default MDXProvider;