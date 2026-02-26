"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Heading, { Level } from "@tiptap/extension-heading";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link2,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorProps {
  onChange: (value: string) => void;
  defaultValue: string;
  placeholder: string;
  onChangeHTML: (html: string) => void;
}

export default function Editor({
  defaultValue,
  onChange,
  placeholder,
  onChangeHTML,
}: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Heading,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[200px] w-full px-3 py-2 rounded-b-md focus:outline-none text-sm text-gray-800 max-w-4xl break-all",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const html = editor.getHTML();
      onChangeHTML(html);
      onChange(text);
    },
  });

  if (!editor) return null;

  // Toolbar button helper
  const ToolbarButton = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-1.5 rounded hover:bg-gray-100 transition-colors",
        active && "bg-gray-200"
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full border rounded-md bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2 text-gray-600">
        {/* Bold / Italic / Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        {/* Heading selector */}
        <select
          onChange={(e) => {
            let level = Number(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              const level$ = level as Level;
              editor.chain().focus().toggleHeading({ level: level$ }).run();
            }
          }}
          className="text-sm border-none bg-transparent outline-none"
        >
          <option value="0">Đoạn văn</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
        </select>

        {/* Align */}
        <select
          onChange={(e) =>
            editor
              .chain()
              .focus()
              .setTextAlign(e.target.value as any)
              .run()
          }
          className="text-sm border-none bg-transparent outline-none"
        >
          <option value="left">Căn trái</option>
          <option value="center">Căn giữa</option>
          <option value="right">Căn phải</option>
        </select>

        {/* List */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Nhập URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        >
          <Link2 size={16} />
        </ToolbarButton>

        {/* Code */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          <Code size={16} />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        placeholder={placeholder}
        className="px-3 py-2 min-h-[120px] max-h-[60vh] overflow-y-auto"
      />
    </div>
  );
}
