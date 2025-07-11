import { MenuActions } from './menuActions';

export interface MenuAction {
  id: string;
  label: string;
  shortcut?: string;
  enabled: boolean;
  action: () => void | Promise<void>;
}

export class MenuActionManager {
  private static instance: MenuActionManager;
  private actions: Map<string, MenuAction> = new Map();

  private constructor() {
    this.registerDefaultActions();
  }

  static getInstance(): MenuActionManager {
    if (!MenuActionManager.instance) {
      MenuActionManager.instance = new MenuActionManager();
    }
    return MenuActionManager.instance;
  }

  registerAction(action: MenuAction): void {
    this.actions.set(action.id, action);
  }

  async executeAction(actionId: string): Promise<void> {
    const action = this.actions.get(actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }

    if (!action.enabled) {
      throw new Error(`Action is disabled: ${actionId}`);
    }

    try {
      await action.action();
    } catch (error) {
      console.error(`Failed to execute action ${actionId}:`, error);
      throw error;
    }
  }

  updateActionState(actionId: string, enabled: boolean): void {
    const action = this.actions.get(actionId);
    if (action) {
      action.enabled = enabled;
    }
  }

  getAction(actionId: string): MenuAction | undefined {
    return this.actions.get(actionId);
  }

  getAllActions(): MenuAction[] {
    return Array.from(this.actions.values());
  }

  private registerDefaultActions(): void {
    // File menu actions
    this.registerAction({
      id: 'file.newFile',
      label: 'New File',
      shortcut: 'Cmd+N',
      enabled: true,
      action: () => MenuActions.newFile()
    });

    this.registerAction({
      id: 'file.openFile',
      label: 'Open File...',
      shortcut: 'Cmd+O',
      enabled: true,
      action: () => MenuActions.openFile()
    });

    this.registerAction({
      id: 'file.openFolder',
      label: 'Open Folder...',
      shortcut: 'Cmd+Shift+O',
      enabled: true,
      action: () => MenuActions.openFolder()
    });

    this.registerAction({
      id: 'file.save',
      label: 'Save',
      shortcut: 'Cmd+S',
      enabled: true,
      action: () => MenuActions.save()
    });

    this.registerAction({
      id: 'file.saveAs',
      label: 'Save As...',
      shortcut: 'Cmd+Shift+S',
      enabled: true,
      action: () => MenuActions.saveAs()
    });

    this.registerAction({
      id: 'file.close',
      label: 'Close',
      shortcut: 'Cmd+W',
      enabled: true,
      action: () => MenuActions.close()
    });

    this.registerAction({
      id: 'file.exit',
      label: 'Exit',
      shortcut: 'Cmd+Q',
      enabled: true,
      action: () => MenuActions.exit()
    });

    // Edit menu actions
    this.registerAction({
      id: 'edit.undo',
      label: 'Undo',
      shortcut: 'Cmd+Z',
      enabled: true,
      action: () => MenuActions.undo()
    });

    this.registerAction({
      id: 'edit.redo',
      label: 'Redo',
      shortcut: 'Cmd+Shift+Z',
      enabled: true,
      action: () => MenuActions.redo()
    });

    this.registerAction({
      id: 'edit.cut',
      label: 'Cut',
      shortcut: 'Cmd+X',
      enabled: true,
      action: () => MenuActions.cut()
    });

    this.registerAction({
      id: 'edit.copy',
      label: 'Copy',
      shortcut: 'Cmd+C',
      enabled: true,
      action: () => MenuActions.copy()
    });

    this.registerAction({
      id: 'edit.paste',
      label: 'Paste',
      shortcut: 'Cmd+V',
      enabled: true,
      action: () => MenuActions.paste()
    });

    this.registerAction({
      id: 'edit.selectAll',
      label: 'Select All',
      shortcut: 'Cmd+A',
      enabled: true,
      action: () => MenuActions.selectAll()
    });

    this.registerAction({
      id: 'edit.find',
      label: 'Find',
      shortcut: 'Cmd+F',
      enabled: true,
      action: () => MenuActions.find()
    });

    this.registerAction({
      id: 'edit.replace',
      label: 'Replace',
      shortcut: 'Cmd+H',
      enabled: true,
      action: () => MenuActions.replace()
    });

    // View menu actions
    this.registerAction({
      id: 'view.toggleSidebar',
      label: 'Toggle Sidebar',
      shortcut: 'Cmd+B',
      enabled: true,
      action: () => MenuActions.toggleSidebar()
    });

    this.registerAction({
      id: 'view.toggleStatusBar',
      label: 'Toggle Status Bar',
      enabled: true,
      action: () => MenuActions.toggleStatusBar()
    });

    this.registerAction({
      id: 'view.zoomIn',
      label: 'Zoom In',
      shortcut: 'Cmd+=',
      enabled: true,
      action: () => MenuActions.zoomIn()
    });

    this.registerAction({
      id: 'view.zoomOut',
      label: 'Zoom Out',
      shortcut: 'Cmd+-',
      enabled: true,
      action: () => MenuActions.zoomOut()
    });

    this.registerAction({
      id: 'view.resetZoom',
      label: 'Reset Zoom',
      shortcut: 'Cmd+0',
      enabled: true,
      action: () => MenuActions.resetZoom()
    });

    this.registerAction({
      id: 'view.fullScreen',
      label: 'Full Screen',
      shortcut: 'F11',
      enabled: true,
      action: () => MenuActions.fullScreen()
    });

    // Help menu actions
    this.registerAction({
      id: 'help.about',
      label: 'About',
      enabled: true,
      action: () => MenuActions.about()
    });

    this.registerAction({
      id: 'help.documentation',
      label: 'Documentation',
      enabled: true,
      action: () => MenuActions.documentation()
    });

    this.registerAction({
      id: 'help.shortcuts',
      label: 'Keyboard Shortcuts',
      enabled: true,
      action: () => MenuActions.shortcuts()
    });
  }
} 
