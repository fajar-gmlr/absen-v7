export type ToolType = 'calculator' | 'converter' | 'interpolation' | 'waterdraw' | 'api1952' | 'rtd';

export interface ToolDefinition {
  id: ToolType;
  name: string;
  icon: string;
}