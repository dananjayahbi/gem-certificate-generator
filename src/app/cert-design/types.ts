// Types for Certificate Designer
export interface DragState {
  x: number;
  y: number;
  fieldX: number;
  fieldY: number;
}

export interface ResizeState {
  x: number;
  y: number;
  width: number;
  height: number;
  fieldX: number;
  fieldY: number;
  corner: string;
}

export interface PanState {
  x: number;
  y: number;
  scrollLeft: number;
  scrollTop: number;
}

export interface DeleteModalState {
  isOpen: boolean;
  templateId: string;
  templateName: string;
}
