import * as vscode from 'vscode';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'promptEnhancer.enhance';
        this.statusBarItem.text = '$(loading~spin) Đang tải...';
        this.statusBarItem.tooltip = 'Đang khởi tạo Prompt Enhancer...';
    }

    show(): void {
        this.statusBarItem.show();
    }

    setReady(): void {
        this.statusBarItem.text = '$(sparkle) Nâng Cao';
        this.statusBarItem.tooltip = 'Nhấn để nâng cao prompt';
    }

    setEnhancing(): void {
        this.statusBarItem.text = '$(sync~spin) Đang nâng cao...';
        this.statusBarItem.tooltip = 'Đang nâng cao prompt của bạn...';
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}

