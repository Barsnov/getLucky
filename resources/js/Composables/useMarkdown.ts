import MarkdownIt from 'markdown-it';
import markdownItMark from 'markdown-it-mark';

const mdInstance = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    breaks: true,
}).use(markdownItMark);

export function useMarkdown() {
    const renderMarkdown = (text?: string | null): string => {
        return typeof text === 'string' ? mdInstance.render(text) : '';
    };

    return {
        renderMarkdown,
    };
}
