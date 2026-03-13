import type { FileSystemContext } from '@augmentcode/auggie-sdk';

export interface EnhanceResult {
    original: string;
    enhanced: string;
}

export const DEFAULT_SYSTEM_PROMPT =
    'Đây là một chỉ dẫn mà tôi muốn đưa cho bạn, nhưng nó cần được cải thiện. ' +
    'Hãy viết lại và nâng cao chỉ dẫn này để làm cho nó rõ ràng hơn, cụ thể hơn, ' +
    'ít mơ hồ hơn, và sửa các lỗi sai nếu có. ' +
    'QUAN TRỌNG: Hãy trả lời bằng CHÍNH NGÔN NGỮ của chỉ dẫn gốc (nếu tiếng Việt thì trả lời tiếng Việt, nếu tiếng Anh thì trả lời tiếng Anh). ' +
    'Nếu có code trong dấu ba backticks (```) hãy xem xét xem đó có phải là code mẫu và nên giữ nguyên không. ' +
    'Trả lời theo định dạng sau:\n\n' +
    '### BEGIN RESPONSE ###\n' +
    '<enhanced-prompt>prompt đã được cải thiện ở đây</enhanced-prompt>\n' +
    '### END RESPONSE ###\n\n' +
    'Đây là chỉ dẫn gốc của tôi:\n\n';

export class PromptEnhancer {
    private context: FileSystemContext | null = null;
    private workspaceRoot: string;
    private systemPrompt: string = DEFAULT_SYSTEM_PROMPT;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = workspaceRoot;
    }

    setSystemPrompt(prompt: string) {
        this.systemPrompt = prompt;
    }

    async initialize(): Promise<void> {
        // Guard against double initialization (idempotent)
        if (this.context) {
            return;
        }
        
        const { FileSystemContext } = await import('@augmentcode/auggie-sdk');
        this.context = await FileSystemContext.create({
            directory: this.workspaceRoot,
            debug: false
        });
    }

    async enhancePrompt(prompt: string): Promise<EnhanceResult> {
        if (!this.context) {
            throw new Error('PromptEnhancer chưa được khởi tạo. Hãy gọi initialize() trước.');
        }

        // Note: searchAndAsk(query, question) - first arg is search query for codebase retrieval,
        // second arg is the full prompt sent to LLM. System prompt is prepended to user prompt.
        // Language reminder is appended AFTER codebase context injection to prevent English override.
        const languageReminder = '\n\nNHẮC LẠI QUAN TRỌNG: Bạn PHẢI trả lời bằng CÙNG ngôn ngữ với prompt gốc bên trên. Nếu prompt gốc bằng tiếng Việt thì trả lời tiếng Việt. Nếu tiếng Anh thì tiếng Anh.';
        const fullPrompt = this.systemPrompt + prompt + languageReminder;
        const response = await this.context.searchAndAsk(prompt, fullPrompt);
        const enhanced = this.parseEnhancedPrompt(response);

        if (!enhanced) {
            throw new Error('Không thể phân tích prompt đã nâng cao từ phản hồi');
        }

        return { original: prompt, enhanced };
    }

    private parseEnhancedPrompt(response: string): string | null {
        // Try to extract from XML tags first
        const match = response.match(/<enhanced-prompt>([\s\S]*?)<\/enhanced-prompt>/);
        if (match?.[1]) {
            return match[1].trim();
        }
        
        // Fallback: strip common prefixes and BEGIN/END markers
        let cleaned = response
            .replace(/^###\s*BEGIN RESPONSE\s*###\s*/i, '')
            .replace(/###\s*END RESPONSE\s*###\s*$/i, '')
            .replace(/^(Enhanced|Improved|Rewritten):\s*/i, '')
            .trim();
        
        return cleaned || null;
    }

    async dispose(): Promise<void> {
        if (this.context) {
            await this.context.close();
            this.context = null;
        }
    }
}

