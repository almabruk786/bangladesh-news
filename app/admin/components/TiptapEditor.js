import { useEditor, EditorContent } from '@tiptap/react';
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
import {
    Bold, Italic, Underline as UnderlineIcon,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon,
    Table as TableIcon, Link as LinkIcon,
    Undo, Redo, Code, // Added Code icon
    AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react'; // Added useState

const MenuBar = ({ editor, onImageUpload, addVideo, isSourceMode, toggleSourceMode }) => {
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
            {/* Disable other buttons when in Source Mode */}
            <div className={`flex flex-wrap gap-1 ${isSourceMode ? 'opacity-50 pointer-events-none' : ''}`}>
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Bold size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Italic size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><UnderlineIcon size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignLeft size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignCenter size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignRight size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignJustify size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading1 size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading2 size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading3 size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><List size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><ListOrdered size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Quote size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={setLink} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><LinkIcon size={18} /></button>
                <button type="button" onClick={addImage} className="p-2 rounded hover:bg-slate-200 text-slate-600"><ImageIcon size={18} /></button>
                <button type="button" onClick={addYoutube} className="p-2 rounded hover:bg-slate-200 text-slate-600"><YoutubeIcon size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><TableIcon size={18} /></button>

                <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

                <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><Undo size={18} /></button>
                <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><Redo size={18} /></button>
            </div>

            {/* Source Code Toggle Button - Always Active */}
            <div className="ml-auto border-l border-slate-300 pl-1">
                 <button 
                    type="button" 
                    onClick={toggleSourceMode} 
                    className={`p-2 rounded hover:bg-slate-200 ${isSourceMode ? 'bg-blue-100 text-blue-600 font-bold' : 'text-slate-600'}`}
                    title="Toggle HTML Source"
                >
                    <Code size={18} />
                </button>
            </div>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, onImageUpload }) {
    // State for switching between Visual and HTML mode
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [sourceContent, setSourceContent] = useState(content || '');

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
                placeholder: 'Write something amazing...',
            })
        ],
        content: content,
        onUpdate: ({ editor }) => {
            // Only update parent if we are in Visual mode
            if (!isSourceMode) {
                onChange(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-strong:font-black prose-headings:font-bold',
            },
            transformPastedHTML(html) {
                // Ensure bold tags from mobile are respected
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

    // Sync editor content when prop changes (Initial Load)
    useEffect(() => {
        if (editor && content && !isSourceMode) {
            // Check if content is different to avoid cursor jumping or infinite loops
            if (editor.getHTML() !== content) {
                 // Only set if editor is basically empty or it's an initial load
                 // (This logic prevents overwriting while typing if parent re-renders)
                 if(editor.getText().trim() === "" && content.trim() !== "") {
                     editor.commands.setContent(content);
                 }
            }
        }
    }, [content, editor, isSourceMode]);

    // Handle Toggling Source Mode
    const handleToggleSource = () => {
        if (!editor) return;

        if (isSourceMode) {
            // Switch BACK to Visual Mode: Update Editor from Textarea
            editor.commands.setContent(sourceContent);
            onChange(sourceContent); // Notify parent immediately
        } else {
            // Switch TO Source Mode: Get HTML from Editor
            const html = editor.getHTML();
            setSourceContent(html);
        }
        setIsSourceMode(!isSourceMode);
    };

    // Handle Textarea Change
    const handleSourceChange = (e) => {
        const val = e.target.value;
        setSourceContent(val);
        onChange(val); // Keep parent synced even in HTML mode
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <MenuBar 
                editor={editor} 
                onImageUpload={onImageUpload} 
                addVideo={addVideo} 
                isSourceMode={isSourceMode}
                toggleSourceMode={handleToggleSource}
            />
            
            {/* Conditional Rendering: Editor vs Textarea */}
            {isSourceMode ? (
                <textarea
                    value={sourceContent}
                    onChange={handleSourceChange}
                    className="w-full min-h-[300px] p-4 font-mono text-sm text-slate-700 bg-slate-50 focus:outline-none resize-y"
                    placeholder="Enter HTML code here..."
                />
            ) : (
                <EditorContent editor={editor} />
            )}
        </div>
    );
}
    // Ideally, this demands a custom extension, but we'll use a specific implementation if needed.
    // For now, we'll just check if the user wants a warning block, we can insert a blockquote with a class if supported, 
    // or just standard blockquote. The requirement said "Note/Warning block". 
    // We will stick to standard Blockquote for "Quote" and maybe a "Callout" if we had the extension.
    // Tiptap doesn't have "Callout" in starter kit. 
    // Let's implement a simple "Wrap in Blockquote" for now as "Quote".

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
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Bold size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Italic size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><UnderlineIcon size={18} /></button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignLeft size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignCenter size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignRight size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><AlignJustify size={18} /></button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading1 size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading2 size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Heading3 size={18} /></button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><List size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><ListOrdered size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><Quote size={18} /></button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button type="button" onClick={setLink} className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200 text-blue-600' : 'text-slate-600'}`}><LinkIcon size={18} /></button>
            <button type="button" onClick={addImage} className="p-2 rounded hover:bg-slate-200 text-slate-600"><ImageIcon size={18} /></button>
            <button type="button" onClick={addYoutube} className="p-2 rounded hover:bg-slate-200 text-slate-600"><YoutubeIcon size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><TableIcon size={18} /></button>

            <div className="w-px h-6 bg-slate-300 mx-1 self-center"></div>

            <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><Undo size={18} /></button>
            <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-slate-200 text-slate-600"><Redo size={18} /></button>
        </div>
    );
};

export default function TiptapEditor({ content, onChange, onImageUpload }) {
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
                placeholder: 'Write something amazing...',
            })
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-strong:font-black prose-headings:font-bold',
            },
            transformPastedHTML(html) {
                // Ensure bold tags from mobile are respected
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

    // Sync editor content when prop changes (e.g., initial load)
    useEffect(() => {
        if (editor && content) {
            // Check if editor is empty but content prop has value (Initial Load / Edit Mode)
            if (editor.getText().trim() === "" && content.trim() !== "") {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <MenuBar editor={editor} onImageUpload={onImageUpload} addVideo={addVideo} />
            <EditorContent editor={editor} />
        </div>
    );
}
