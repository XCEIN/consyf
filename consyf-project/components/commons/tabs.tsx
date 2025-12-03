import {
  Tabs as TabsShadcn,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsProps,
} from "@/components/ui/tabs";

function Tabs(props: TabsProps) {
  return <TabsShadcn {...props} />;
}
Tabs.Content = TabsContent;
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;

export default Tabs;
