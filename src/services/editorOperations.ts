import { useEditorStore } from '../stores/editorStore';

export class EditorOperations {
  static undo(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'undo', null);
    }
  }

  static redo(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'redo', null);
    }
  }

  static cut(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'cut', null);
    }
  }

  static copy(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'copy', null);
    }
  }

  static paste(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'paste', null);
    }
  }

  static selectAll(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'selectAll', null);
    }
  }

  static find(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'actions.find', null);
    }
  }

  static replace(): void {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      editorInstance.trigger('keyboard', 'editor.action.startFindReplaceAction', null);
    }
  }

  static getSelectedText(): string {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      const selection = editorInstance.getSelection();
      if (selection) {
        return editorInstance.getModel()?.getValueInRange(selection) || '';
      }
    }
    return '';
  }

  static hasSelection(): boolean {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      const selection = editorInstance.getSelection();
      return selection ? !selection.isEmpty() : false;
    }
    return false;
  }

  static canUndo(): boolean {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      const undoAction = editorInstance.getAction('undo');
      return undoAction ? undoAction.isSupported() : false;
    }
    return false;
  }

  static canRedo(): boolean {
    const { editorInstance } = useEditorStore.getState();
    if (editorInstance) {
      const redoAction = editorInstance.getAction('redo');
      return redoAction ? redoAction.isSupported() : false;
    }
    return false;
  }
} 
