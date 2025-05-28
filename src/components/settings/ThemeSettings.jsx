import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { themes } from "../../themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Monitor, Moon, Sun, Palette } from "lucide-react";

/**
 * Theme settings component that allows users to choose from VS Code themes
 */
export default function ThemeSettings() {
  const { themeId, changeTheme } = useTheme();
  const [previewId, setPreviewId] = useState(null);

  // Handle theme change
  const handleThemeChange = (id) => {
    changeTheme(id);
    setPreviewId(null);
  };

  // Preview a theme on hover without changing it
  const handleThemePreview = (id) => {
    setPreviewId(id);
    // Apply preview theme temporarily
    const previewTheme = themes[id];
    document.documentElement.classList.add('theme-preview');
    Object.entries(previewTheme).forEach(([key, value]) => {
      if (typeof value === 'string' && key !== 'name' && key !== 'id') {
        document.documentElement.style.setProperty(`--preview-${key}`, value);
      }
    });
  };

  // Reset preview when mouse leaves
  const handleEndPreview = () => {
    setPreviewId(null);
    document.documentElement.classList.remove('theme-preview');
  };

  // Group themes by light/dark
  const darkThemes = Object.values(themes).filter(t => 
    !['github-light', 'solarized-light'].includes(t.id)
  );
  const lightThemes = Object.values(themes).filter(t => 
    ['github-light', 'solarized-light'].includes(t.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Theme Settings</CardTitle>
        </div>
        <CardDescription>
          Customize your experience with VS Code-inspired themes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">
              <Palette className="h-4 w-4 mr-2" /> All Themes
            </TabsTrigger>
            <TabsTrigger value="dark">
              <Moon className="h-4 w-4 mr-2" /> Dark
            </TabsTrigger>
            <TabsTrigger value="light">
              <Sun className="h-4 w-4 mr-2" /> Light
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Theme</label>
                <Select value={themeId} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(themes).map((theme) => (
                      <SelectItem 
                        key={theme.id} 
                        value={theme.id}
                        onMouseEnter={() => handleThemePreview(theme.id)}
                        onMouseLeave={handleEndPreview}
                      >
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {Object.values(themes).map((theme) => (
                  <div
                    key={theme.id}
                    className={`
                      cursor-pointer rounded-md p-4 border 
                      transition-all duration-200
                      ${themeId === theme.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}
                    `}
                    style={{
                      backgroundColor: theme.card,
                      color: theme.foreground,
                      borderColor: theme.border,
                    }}
                    onClick={() => handleThemeChange(theme.id)}
                    onMouseEnter={() => handleThemePreview(theme.id)}
                    onMouseLeave={handleEndPreview}
                  >
                    <div className="text-xs mb-2">{theme.name}</div>
                    <div className="flex gap-2">
                      {['primary', 'accent', 'success', 'error', 'warning'].map((color) => (
                        <div
                          key={color}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme[color] }}
                          title={color.charAt(0).toUpperCase() + color.slice(1)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dark">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {darkThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`
                    cursor-pointer rounded-md p-4 border 
                    transition-all duration-200
                    ${themeId === theme.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}
                  `}
                  style={{
                    backgroundColor: theme.card,
                    color: theme.foreground,
                    borderColor: theme.border,
                  }}
                  onClick={() => handleThemeChange(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={handleEndPreview}
                >
                  <div className="text-xs mb-2">{theme.name}</div>
                  <div className="flex gap-2">
                    {['primary', 'accent', 'success', 'error', 'warning'].map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme[color] }}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="light">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lightThemes.map((theme) => (
                <div
                  key={theme.id}
                  className={`
                    cursor-pointer rounded-md p-4 border 
                    transition-all duration-200
                    ${themeId === theme.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}
                  `}
                  style={{
                    backgroundColor: theme.card,
                    color: theme.foreground,
                    borderColor: theme.border,
                  }}
                  onClick={() => handleThemeChange(theme.id)}
                  onMouseEnter={() => handleThemePreview(theme.id)}
                  onMouseLeave={handleEndPreview}
                >
                  <div className="text-xs mb-2">{theme.name}</div>
                  <div className="flex gap-2">
                    {['primary', 'accent', 'success', 'error', 'warning'].map((color) => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme[color] }}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 