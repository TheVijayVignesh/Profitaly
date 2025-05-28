import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel
} from "@/components/ui/form";
import { 
  Switch
} from "@/components/ui/switch";
import { 
  Button 
} from "@/components/ui/button";
import { Bell, Mail, DollarSign, ArrowDown, Award, Clock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  advisorUpdates: z.boolean().default(true),
  priceDrop: z.boolean().default(true),
  emailAlerts: z.boolean().default(true),
  fantasyUpdates: z.boolean().default(true),
  learningContent: z.boolean().default(true),
  weeklyDigest: z.boolean().default(true),
});

const NotificationSettings = ({ data, updateProfile }) => {
  const defaultValues = {
    advisorUpdates: data?.advisorUpdates !== false,
    priceDrop: data?.priceDrop !== false,
    emailAlerts: data?.emailAlerts !== false,
    fantasyUpdates: data?.fantasyUpdates !== false,
    learningContent: data?.learningContent !== false,
    weeklyDigest: data?.weeklyDigest !== false,
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (values) => {
    updateProfile(values);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notifications & Alerts</CardTitle>
        </div>
        <CardDescription>
          Control what notifications and alerts you receive
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">App Notifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="advisorUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Advisor Suggestions
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Receive notifications when AI suggests new stocks
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priceDrop"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <ArrowDown className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Price Drop Alerts
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Get alerts when watchlisted stocks drop in price
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fantasyUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Fantasy & Trial Updates
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Updates about your fantasy portfolio and trial room
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="learningContent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Learning Content Updates
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Be notified about new courses and learning materials
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailAlerts"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Email Alerts
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Receive important alerts via email
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weeklyDigest"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormLabel className="font-medium">
                            Weekly Digest
                          </FormLabel>
                        </div>
                        <FormDescription>
                          Weekly summary of market changes and your portfolio
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Notification Settings</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings; 