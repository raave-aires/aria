import { Settings } from "lucide-react";
import { Button } from "../ui/glass/button";
import { Card, CardContent } from "../ui/glass/card";
import { ThemeToggle } from "../ui/theme-toggle";

export function SettingsBallon() {
  return (
    <Card className="glass-frosted w-fit gap-0 rounded-2xl py-1">
      <CardContent className="flex items-center gap-1 px-1">
        <ThemeToggle />

        {/* TODO: deixar o botão de configurações funcional */}
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings />
        </Button>
      </CardContent>
    </Card>
  );
};
