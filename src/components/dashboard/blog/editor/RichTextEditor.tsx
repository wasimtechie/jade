"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Highlighter,
  RemoveFormatting,
} from "lucide-react";
import { sanitizeRichTextHtml } from "@/lib/cms/blogCms";
import { uploadBlogMedia } from "./editorUtils";

type RichTextEditorProps = {
  content: string;
  placeholder?: string;
  blogSlug: string;
  onChange: (html: string) => void;
  onSlashQuery?: (query: string | null) => void;
  autoFocus?: boolean;
};

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`blog-editor-toolbar-btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  content,
  placeholder = "Type / for commands, or start writing…",
  blogSlug,
  onChange,
  onSlashQuery,
  autoFocus,
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        horizontalRule: false,
      }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener" } }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: false }),
      HorizontalRule,
      TextStyle,
      Color,
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: content || "<p></p>",
    editorProps: {
      attributes: {
        class: "blog-editor-prose focus:outline-none",
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              void uploadBlogMedia(file, blogSlug).then((url) => {
                editor?.chain().focus().setImage({ src: url }).run();
              });
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const file = event.dataTransfer?.files?.[0];
        if (file?.type.startsWith("image/")) {
          event.preventDefault();
          void uploadBlogMedia(file, blogSlug).then((url) => {
            editor?.chain().focus().setImage({ src: url }).run();
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = sanitizeRichTextHtml(ed.getHTML());
      onChange(html);
      const text = ed.getText();
      if (text.startsWith("/")) {
        onSlashQuery?.(text.slice(1));
      } else {
        onSlashQuery?.(null);
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = sanitizeRichTextHtml(editor.getHTML());
    const incoming = sanitizeRichTextHtml(content || "<p></p>");
    if (current !== incoming) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (autoFocus && editor) {
      editor.commands.focus("end");
    }
  }, [autoFocus, editor]);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="blog-rich-text">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          void uploadBlogMedia(file, blogSlug).then((url) => {
            editor.chain().focus().setImage({ src: url }).run();
          });
          e.target.value = "";
        }}
      />
      {editor && (
        <BubbleMenu editor={editor} className="blog-editor-bubble">
          <ToolbarButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="blog-editor-bubble-sep" />
          <ToolbarButton
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
          >
            H3
          </ToolbarButton>
          <span className="blog-editor-bubble-sep" />
          <ToolbarButton onClick={setLink} title="Link">
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            title="Checklist"
          >
            <ListChecks className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          >
            <Highlighter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().setHorizontalRule().run()
            }
            title="Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
            title="Clear formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </ToolbarButton>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
