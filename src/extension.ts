import * as vscode from 'vscode';
import { PromptEnhancer, DEFAULT_SYSTEM_PROMPT } from './promptEnhancer';
import { StatusBarManager } from './statusBar';
import { InputPanel } from './inputPanel';

export interface PromptTemplate {
    id: string;
    name: string;
    prompt: string;
}

let enhancer: PromptEnhancer | null = null;
let statusBar: StatusBarManager | null = null;
let initializationPromise: Promise<void> | null = null;
let globalContext: vscode.ExtensionContext | undefined;

const STORAGE_KEY = 'promptEnhancer.templates';
const ACTIVE_KEY = 'promptEnhancer.activeTemplate';

const outputChannel = vscode.window.createOutputChannel('Prompt Enhancer');

function log(message: string) {
    outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
}

function getDefaultTemplates(): PromptTemplate[] {
    return [{
        id: 'default',
        name: 'Default Enhancer',
        prompt: DEFAULT_SYSTEM_PROMPT
    }];
}

export function getTemplates(): PromptTemplate[] {
    if (!globalContext) {
        return getDefaultTemplates();
    }
    const stored = globalContext.globalState.get<PromptTemplate[]>(STORAGE_KEY);
    return stored && stored.length > 0 ? stored : getDefaultTemplates();
}

export async function saveTemplates(templates: PromptTemplate[]): Promise<void> {
    if (!globalContext) {
        throw new Error('Extension not activated');
    }
    await globalContext.globalState.update(STORAGE_KEY, templates);
}

export function getActiveTemplateId(): string {
    if (!globalContext) {
        return 'default';
    }
    return globalContext.globalState.get<string>(ACTIVE_KEY) || 'default';
}

export async function setActiveTemplateId(id: string): Promise<void> {
    if (!globalContext) {
        throw new Error('Extension not activated');
    }
    
    // Validate that the template ID exists
    const templates = getTemplates();
    const templateExists = templates.some(t => t.id === id);
    if (!templateExists) {
        log(`Warning: Template ID '${id}' not found, falling back to default`);
        id = templates[0]?.id || 'default';
    }
    
    await globalContext.globalState.update(ACTIVE_KEY, id);
    const active = templates.find(t => t.id === id);
    if (active && enhancer) {
        enhancer.setSystemPrompt(active.prompt);
        log(`Switched to template: ${active.name}`);
    }
}

export async function activate(context: vscode.ExtensionContext) {
    log('Extension activating...');
    globalContext = context;

    statusBar = new StatusBarManager();
    statusBar.show();
    statusBar.setReady();

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    log(`Workspace root: ${workspaceRoot}`);

    enhancer = new PromptEnhancer(workspaceRoot);

    const activeId = getActiveTemplateId();
    const templates = getTemplates();
    const active = templates.find(t => t.id === activeId) || templates[0];
    enhancer.setSystemPrompt(active.prompt);

    const enhanceCommand = vscode.commands.registerCommand('promptEnhancer.enhance', async () => {
        log('Enhance command triggered');
        InputPanel.createOrShow(context.extensionUri, handleEnhance);
    });

    async function handleEnhance(inputText: string): Promise<string> {
        // Log metadata only, not sensitive content
        log(`Enhancing prompt (${inputText.length} chars)`);
        statusBar?.setEnhancing();

        return await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Enhancing prompt with codebase context",
            cancellable: false
        }, async (progress) => {
            try {
                // Promise-based initialization lock to prevent race conditions
                if (!initializationPromise) {
                    progress.report({ increment: 0, message: "Initializing..." });
                    log('Indexing codebase (first use)...');
                    initializationPromise = enhancer!.initialize()
                        .catch((error) => {
                            // Reset promise on failure to allow retry
                            initializationPromise = null;
                            throw error;
                        });
                    
                    progress.report({ increment: 25, message: "Indexing codebase..." });
                    await initializationPromise;
                    log('Indexing complete');
                } else {
                    progress.report({ increment: 50, message: "Using cached index..." });
                    await initializationPromise;
                }

                progress.report({ increment: 25, message: "Generating enhanced prompt..." });
                const result = await enhancer!.enhancePrompt(inputText);
                log(`Enhanced (${result.enhanced.length} chars)`);

                progress.report({ increment: 20, message: "Copying to clipboard..." });
                await vscode.env.clipboard.writeText(result.enhanced);
                
                progress.report({ increment: 5, message: "Done!" });
                return result.enhanced;

            } catch (error) {
                log(`Enhancement failed: ${error}`);
                throw error;
            } finally {
                statusBar?.setReady();
            }
        });
    }

    context.subscriptions.push(enhanceCommand, statusBar, outputChannel);
    log('Extension activated (lazy init - will index on first use)');
}

export async function deactivate() {
    log('Extension deactivating...');
    InputPanel.dispose();
    
    // Wait for initialization to complete before disposing
    if (initializationPromise) {
        try {
            await initializationPromise;
        } catch (error) {
            log(`Initialization failed during deactivation: ${error}`);
        }
    }
    
    if (enhancer) {
        await enhancer.dispose();
    }
}

