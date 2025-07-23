
export type ComponentType = "App" | "Provider" | "Consumer" | "Component";

export interface Component {
  id: string;
  type: ComponentType;
  children: Component[];
  contextValue?: string;
}
