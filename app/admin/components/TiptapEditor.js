"use client";
import { useEditor, EditorContent } from '@tiptap/react';
/* 
   FIX: In this version of @tiptap/react, BubbleMenu and FloatingMenu are not exported from the root.
   They seem to be in a submodule or require separate import.
   Based on exploration, they are in 'dist/menus'. 
   However, attempting to import from '@tiptap/react' failed. 
   We will try to dynamic import or use the specific path if standard import failed.
   Actually, let's try importing from the subpath defined in exports.
*/
// import { BubbleMenu, FloatingMenu } from '@tiptap/react'; // Attempting restart might fix if cache? No.
// Let's try importing from direct file if needed, but 'exports' should map it.
// If 'exports' has "./menus", then "@tiptap/react/menus" is the path.
// BUT, let's comment that out and try the verified path.

// Re-verified: The user error says `BubbleMenu` is undefined from `@tiptap/react`.
// So we MUST change the import source.
import { BubbleMenu as BubbleMenuComponent, FloatingMenu as FloatingMenuComponent } from '@tiptap/react/menus'; // Using the subpath

import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';

// EXTENSIONS
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';

import {
    Bold, Italic, Underline as UnderlineIcon,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon,
    Table as TableIcon, Link as LinkIcon,
    Undo, Redo, AlertTriangle,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Code, Plus, Highlighter, CheckSquare
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const MenuBar = ({ editor, onImageUpload, addVideo, isSourceMode, toggleSource }) => {
    if (!editor) return null;

    const addImage = async () => {
        const url = await onImageUpload();
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addYoutube = () => addVideo(editor);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            {/* ... simplified duplicate buttons for fallback, but main focus is smart menus now ... */}
            <div className={`flex flex-wrap gap-1 items-center ${isSourceMode ? 'hidden' : 'contents'}`}>
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Bold size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Italic size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><UnderlineIcon size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading2 size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading3 size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><List size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><ListOrdered size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={setLink} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><LinkIcon size={18} /></button>
                <button type="button" onClick={addImage} className="p-2 rounded hover:bg-slate-200 text-slate-600"><ImageIcon size={18} /></button>
                <button type="button" onClick={addYoutube} className="p-2 rounded hover:bg-slate-200 text-slate-600"><YoutubeIcon size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>
            </div>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={toggleSource}
                className={`p-2 rounded hover:bg-slate-200 ml-auto ${isSourceMode ? 'bg-slate-800 text-white hover:bg-slate-900' : 'text-slate-600'}`}
                title={isSourceMode ? "Switch to Editor" : "View HTML Source"}
            >
                {isSourceMode ? <span className="text-xs font-bold px-1">WYSIWYG</span> : <Code size={18} />}
            </button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, onImageUpload }) {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [sourceContent, setSourceContent] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Youtube.configure({
                controls: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Underline,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder: 'Type \'/\' for commands...',
            }),
            BubbleMenuExtension,
            FloatingMenuExtension
        ],
        content: content,
        onUpdate: ({ editor }) => {
            if (!isSourceMode) {
                onChange(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-strong:font-black prose-headings:font-bold',
            },
            transformPastedHTML(html) {
                return html.replace(/<span style="font-weight: 700">/g, '<strong>')
                    .replace(/<span style="font-weight: bold">/g, '<strong>');
            },
        },
        parseOptions: {
            preserveWhitespace: 'full',
        },
        immediatelyRender: false,
    });

    const addVideo = useCallback((editor) => {
        const url = window.prompt('Enter YouTube URL');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    }, []);

    useEffect(() => {
        if (editor && content) {
            if (editor.getText().trim() === "" && content.trim() !== "") {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    const toggleSourceMode = () => {
        if (isSourceMode) {
            editor.commands.setContent(sourceContent);
            setIsSourceMode(false);
        } else {
            const html = editor.getHTML();
            setSourceContent(html);
            setIsSourceMode(true);
        }
    };

    const handleSourceChange = (e) => {
        const newHtml = e.target.value;
        setSourceContent(newHtml);
        onChange(newHtml);
    };

    const addImage = async () => {
        const url = await onImageUpload();
        if (url && editor) editor.chain().focus().setImage({ src: url }).run();
    };

    if (!editor) return null;

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white group editor-container">
            <MenuBar
                editor={editor}
                onImageUpload={onImageUpload}
                addVideo={addVideo}
                isSourceMode={isSourceMode}
                toggleSource={toggleSourceMode}
            />

            {/* Bubble Menu: Appears on text selection */}
            {editor && (
                <BubbleMenuComponent editor={editor}>
                    <div className="bg-slate-900 text-white rounded-lg shadow-xl border border-slate-700 p-1 flex items-center gap-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${editor.isActive('bold') ? 'bg-slate-700 text-blue-400' : ''}`}
                        >
                            <Bold size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${editor.isActive('italic') ? 'bg-slate-700 text-blue-400' : ''}`}
                        >
                            <Italic size={14} />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${editor.isActive('underline') ? 'bg-slate-700 text-blue-400' : ''}`}
                        >
                            <UnderlineIcon size={14} />
                        </button>
                        <div className="w-px h-4 bg-slate-700 mx-1"></div>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-blue-400' : ''}`}
                        >
                            <Heading2 size={14} />
                        </button>
                        <button
                            onClick={() => {
                                const url = window.prompt('URL');
                                if (url) editor.chain().focus().setLink({ href: url }).run();
                            }}
                            className={`p-1.5 rounded hover:bg-slate-700 transition ${editor.isActive('link') ? 'bg-slate-700 text-blue-400' : ''}`}
                        >
                            <LinkIcon size={14} />
                        </button>
                    </div>
                </BubbleMenuComponent>
            )}

            {/* Floating Menu: Appears on empty lines */}
            {editor && (
                <FloatingMenuComponent editor={editor} className="flex gap-2">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className="bg-white text-slate-500 border border-slate-200 shadow-sm p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 text-xs font-bold"
                    >
                        <Heading2 size={16} /> Heading
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className="bg-white text-slate-500 border border-slate-200 shadow-sm p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 text-xs font-bold"
                    >
                        <List size={16} /> List
                    </button>
                    <button
                        onClick={addImage}
                        className="bg-white text-slate-500 border border-slate-200 shadow-sm p-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2 text-xs font-bold"
                    >
                        <ImageIcon size={16} /> Image
                    </button>
                </FloatingMenuComponent>
            )}

            {isSourceMode ? (
                <textarea
                    value={sourceContent}
                    onChange={handleSourceChange}
                    className="w-full h-[500px] p-4 font-mono text-sm outline-none resize-y bg-slate-50 text-slate-800"
                    placeholder="Enter HTML code here..."
                />
            ) : (
                <div className="relative min-h-[300px]">
                    <EditorContent editor={editor} />
                </div>
            )}
        </div>
    );
}
