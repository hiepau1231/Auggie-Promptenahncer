import * as vscode from 'vscode';
import { getTemplates, saveTemplates, getActiveTemplateId, setActiveTemplateId, PromptTemplate } from './extension';
import { DEFAULT_SYSTEM_PROMPT } from './promptEnhancer';

type EnhanceHandler = (text: string) => Promise<string>;

export class InputPanel {
    private static panel: vscode.WebviewPanel | undefined;
    private static handler: EnhanceHandler | undefined;

    static createOrShow(extensionUri: vscode.Uri, handler: EnhanceHandler) {
        this.handler = handler;

        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Two);
            this.sendTemplates();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'promptEnhancer',
            'Prompt Enhancer',
            { viewColumn: vscode.ViewColumn.Two, preserveFocus: false },
            { enableScripts: true, retainContextWhenHidden: true }
        );

        this.panel.webview.html = this.getHtml();
        this.sendTemplates();

        this.panel.webview.onDidReceiveMessage(async (msg) => {
            try {
                if (msg.type === 'enhance' && this.handler) {
                    // Validate input
                    if (typeof msg.text !== 'string' || msg.text.trim() === '') {
                        this.panel?.webview.postMessage({ type: 'error', error: 'Văn bản đầu vào là bắt buộc' });
                        return;
                    }
                    if (msg.text.length > 50000) {
                        this.panel?.webview.postMessage({ type: 'error', error: 'Văn bản đầu vào quá dài (tối đa 50,000 ký tự)' });
                        return;
                    }
                    
                    try {
                        this.panel?.webview.postMessage({ type: 'status', status: 'enhancing' });
                        const enhanced = await this.handler(msg.text);
                        this.panel?.webview.postMessage({ type: 'result', enhanced });
                    } catch (error) {
                        this.panel?.webview.postMessage({ type: 'error', error: String(error) });
                    }
                } else if (msg.type === 'getTemplates') {
                    this.sendTemplates();
                } else if (msg.type === 'saveTemplate') {
                    // Validate template data
                    if (!msg.template || typeof msg.template !== 'object') {
                        this.panel?.webview.postMessage({ type: 'error', error: 'Dữ liệu mẫu không hợp lệ' });
                        return;
                    }
                    if (typeof msg.template.id !== 'string' || typeof msg.template.name !== 'string' || typeof msg.template.prompt !== 'string') {
                        this.panel?.webview.postMessage({ type: 'error', error: 'Các trường mẫu không hợp lệ' });
                        return;
                    }
                    if (msg.template.name.length > 100 || msg.template.prompt.length > 10000) {
                        this.panel?.webview.postMessage({ type: 'error', error: 'Tên mẫu hoặc prompt quá dài' });
                        return;
                    }
                    
                    const templates = getTemplates();
                    const existing = templates.findIndex(t => t.id === msg.template.id);
                    if (existing >= 0) {
                        templates[existing] = msg.template;
                    } else {
                        templates.push(msg.template);
                    }
                    await saveTemplates(templates);
                    this.sendTemplates();
                } else if (msg.type === 'deleteTemplate') {
                    if (typeof msg.id !== 'string') {
                        return;
                    }
                    
                    const templates = getTemplates().filter(t => t.id !== msg.id);
                    if (templates.length === 0) {
                        templates.push({ id: 'default', name: 'Mẫu Mặc Định', prompt: DEFAULT_SYSTEM_PROMPT });
                    }
                    await saveTemplates(templates);
                    if (getActiveTemplateId() === msg.id) {
                        await setActiveTemplateId(templates[0].id);
                    }
                    this.sendTemplates();
                } else if (msg.type === 'setActive') {
                    if (typeof msg.id !== 'string') {
                        return;
                    }
                    await setActiveTemplateId(msg.id);
                    this.sendTemplates();
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                this.panel?.webview.postMessage({ type: 'error', error: errorMsg });
            }
        });

        this.panel.onDidDispose(() => { this.panel = undefined; });
    }

    private static sendTemplates() {
        const templates = getTemplates();
        const activeId = getActiveTemplateId();
        this.panel?.webview.postMessage({ type: 'templates', templates, activeId });
    }

    static dispose() {
        this.panel?.dispose();
        this.panel = undefined;
    }

    private static getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private static getHtml(): string {
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--vscode-font-family); padding: 16px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); height: 100vh; display: flex; flex-direction: column; }
        .header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .header h3 { flex: 1; }
        .icon-btn { background: none; border: none; color: var(--vscode-foreground); cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; }
        .icon-btn:hover { background: var(--vscode-toolbar-hoverBackground); }
        .template-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
        select { flex: 1; padding: 6px 10px; background: var(--vscode-dropdown-background); color: var(--vscode-dropdown-foreground); border: 1px solid var(--vscode-dropdown-border); border-radius: 4px; font-size: 13px; }
        textarea { width: 100%; height: 100px; padding: 12px; border: 1px solid var(--vscode-input-border); background: var(--vscode-input-background); color: var(--vscode-input-foreground); border-radius: 4px; font-size: 14px; resize: vertical; margin-bottom: 12px; }
        textarea:focus { outline: 1px solid var(--vscode-focusBorder); }
        .btn-row { display: flex; gap: 8px; margin-bottom: 12px; }
        button { padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; font-size: 13px; }
        button:hover { background: var(--vscode-button-hoverBackground); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-enhance { flex: 1; }
        .btn-secondary { background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
        .btn-secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
        .status { padding: 10px; border-radius: 4px; margin-bottom: 12px; display: none; }
        .status.show { display: block; }
        .status.enhancing, .status.success { background: var(--vscode-inputValidation-infoBackground); }
        .status.error { background: var(--vscode-inputValidation-errorBackground); }
        .result { flex: 1; padding: 12px; background: var(--vscode-textBlockQuote-background); border-radius: 4px; overflow: auto; white-space: pre-wrap; font-size: 13px; display: none; min-height: 80px; }
        .result.show { display: block; }
        .settings-panel { display: none; border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 12px; margin-bottom: 12px; background: var(--vscode-editorWidget-background); }
        .settings-panel.show { display: block; }
        .settings-panel label { display: block; margin-bottom: 4px; font-size: 12px; color: var(--vscode-descriptionForeground); }
        .settings-panel input { width: 100%; padding: 6px 10px; margin-bottom: 8px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 4px; }
        .settings-panel textarea { height: 120px; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h3>✨ Nâng Cao Prompt</h3>
        <button class="icon-btn" id="settingsBtn" title="Cài đặt">⚙️</button>
    </div>

    <div class="template-row">
        <select id="templateSelect"></select>
        <button class="btn-secondary" id="newBtn" title="New Template">+</button>
    </div>

    <div id="settingsPanel" class="settings-panel">
        <label>Tên Mẫu</label>
        <input type="text" id="templateName" placeholder="Mẫu của tôi">
        <label>System Prompt</label>
        <textarea id="templatePrompt" placeholder="Nhập system prompt..."></textarea>
        <div class="btn-row">
            <button id="saveTemplateBtn">Lưu</button>
            <button class="btn-secondary" id="deleteTemplateBtn">Xóa</button>
            <button class="btn-secondary" id="closeSettingsBtn">Đóng</button>
        </div>
    </div>

    <textarea id="input" placeholder="Nhập prompt của bạn ở đây..."></textarea>
    <div class="btn-row">
        <button id="enhanceBtn" class="btn-enhance">Nâng Cao Prompt</button>
        <button id="clearBtn" class="btn-secondary">Xóa</button>
    </div>
    <div id="status" class="status"></div>
    <div id="result" class="result"></div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const input = document.getElementById('input');
        const enhanceBtn = document.getElementById('enhanceBtn');
        const clearBtn = document.getElementById('clearBtn');
        const status = document.getElementById('status');
        const result = document.getElementById('result');
        const templateSelect = document.getElementById('templateSelect');
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const newBtn = document.getElementById('newBtn');
        const templateName = document.getElementById('templateName');
        const templatePrompt = document.getElementById('templatePrompt');
        const saveTemplateBtn = document.getElementById('saveTemplateBtn');
        const deleteTemplateBtn = document.getElementById('deleteTemplateBtn');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');

        let templates = [];
        let activeId = 'default';
        let editingId = null;

        // HTML escape function to prevent XSS
        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        settingsBtn.onclick = () => {
            const isOpen = settingsPanel.classList.contains('show');
            if (isOpen) {
                settingsPanel.classList.remove('show');
            } else {
                editingId = activeId;
                const t = templates.find(x => x.id === activeId);
                if (t) { templateName.value = t.name; templatePrompt.value = t.prompt; }
                settingsPanel.classList.add('show');
            }
        };

        newBtn.onclick = () => {
            editingId = 'new-' + Date.now();
            templateName.value = '';
            templatePrompt.value = '';
            settingsPanel.classList.add('show');
            templateName.focus();
        };

        closeSettingsBtn.onclick = () => settingsPanel.classList.remove('show');

        saveTemplateBtn.onclick = () => {
            const name = templateName.value.trim();
            const prompt = templatePrompt.value.trim();
            if (!name || !prompt) return;
            vscode.postMessage({ type: 'saveTemplate', template: { id: editingId, name, prompt } });
            settingsPanel.classList.remove('show');
        };

        deleteTemplateBtn.onclick = () => {
            if (editingId && !editingId.startsWith('new-')) {
                vscode.postMessage({ type: 'deleteTemplate', id: editingId });
            }
            settingsPanel.classList.remove('show');
        };

        templateSelect.onchange = () => {
            vscode.postMessage({ type: 'setActive', id: templateSelect.value });
        };

        enhanceBtn.onclick = () => {
            const text = input.value.trim();
            if (!text) return;
            vscode.postMessage({ type: 'enhance', text });
        };

        clearBtn.onclick = () => {
            input.value = '';
            status.className = 'status';
            result.className = 'result';
            input.focus();
        };

        window.addEventListener('message', (e) => {
            const msg = e.data;
            if (msg.type === 'templates') {
                templates = msg.templates;
                activeId = msg.activeId;
                // Use escapeHtml to prevent XSS attacks
                templateSelect.innerHTML = templates.map(t =>
                    '<option value="' + escapeHtml(t.id) + '"' + (t.id === activeId ? ' selected' : '') + '>' + escapeHtml(t.name) + '</option>'
                ).join('');
            } else if (msg.type === 'status') {
                status.className = 'status show enhancing';
                status.textContent = '⏳ Đang nâng cao...';
                enhanceBtn.disabled = true;
            } else if (msg.type === 'result') {
                status.className = 'status show success';
                status.textContent = '✅ Đã sao chép! Dán bằng Ctrl+V';
                result.className = 'result show';
                result.textContent = msg.enhanced;
                enhanceBtn.disabled = false;
            } else if (msg.type === 'error') {
                status.className = 'status show error';
                status.textContent = '❌ ' + msg.error;
                enhanceBtn.disabled = false;
            }
        });

        input.focus();
    </script>
</body>
</html>`;
    }
}

