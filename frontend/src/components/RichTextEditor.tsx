import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Strikethrough } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Toolbar: React.FC<{ editor: any }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-200/50 dark:border-gray-800/50">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="icon"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="icon"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        size="icon"
      >
        <Strikethrough className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="icon"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        size="icon"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[200px]",
      },
    },
  });

  // Update editor content when content prop changes (for journal prompts)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="bg-white/50 dark:bg-black/50 backdrop-blur-lg rounded-3xl shadow-lg border border-gray-200/50 dark:border-gray-800/50">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};


