import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { 
  Checkbox, 
  CheckboxItem 
} from "@/components/ui/checkbox";
import { 
  Button 
} from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, InfoIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const INVESTOR_TYPES = [
  "Cautious Long-Term Builder",
  "Balanced Growth Investor",
  "Aggressive Growth Hunter",
  "Value-Focused Investor",
  "Dividend Income Seeker",
  "Not Set"
];

const MARKETS = [
  "US",
  "India",
  "Europe",
  "Crypto",
  "Commodities", 
  "Forex"
];

const formSchema = z.object({
  investorType: z.string(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  riskAppetite: z.enum(["Low", "Medium", "High"]),
  markets: z.array(z.string()).min(1, "Select at least one market"),
  aiSuggestionsEnabled: z.boolean().default(true),
  suggestionsType: z.enum(["Tailored", "Broad"]).default("Tailored"),
});

const InvestmentIntelligence = ({ data, updateProfile }) => {
  const defaultValues = {
    investorType: data?.investorType || "Not Set",
    strengths: data?.strengths || [],
    weaknesses: data?.weaknesses || [],
    riskAppetite: data?.riskAppetite || "Medium",
    markets: data?.markets || ["US"],
    aiSuggestionsEnabled: data?.aiSuggestionsEnabled !== false,
    suggestionsType: data?.suggestionsType || "Tailored",
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
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Investment Intelligence Profile</CardTitle>
        </div>
        <CardDescription>
          Control how our AI understands your investment preferences and provides suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Investor Type */}
              <FormField
                control={form.control}
                name="investorType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investor Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your investor type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVESTOR_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This helps tailor AI suggestions to your investment style
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Risk Appetite */}
              <FormField
                control={form.control}
                name="riskAppetite"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Risk Appetite</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-1"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Low" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Low
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Medium" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Medium
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="High" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            High
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Determines volatility level in investment suggestions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Markets of Interest */}
              <FormField
                control={form.control}
                name="markets"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Markets of Interest</FormLabel>
                      <FormDescription>
                        Select markets you want to receive suggestions for
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {MARKETS.map((market) => (
                        <FormField
                          key={market}
                          control={form.control}
                          name="markets"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={market}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(market)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, market])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== market
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {market}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AI Behavior Settings */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="aiSuggestionsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable AI Stock Suggestions
                        </FormLabel>
                        <FormDescription>
                          Receive personalized suggestions based on your profile
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                  
                <FormField
                  control={form.control}
                  name="suggestionsType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Suggestions Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Tailored" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Tailored: Focus on my preferences only
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Broad" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Broad: Include diverse suggestions
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths & Weaknesses */}
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <CardTitle className="text-base font-medium">Your Investment Strengths</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {data?.strengths && data.strengths.length > 0 ? (
                    <ul className="ml-6 list-disc [&>li]:mt-2">
                      {data.strengths.map((strength, index) => (
                        <li key={`strength-${index}`}>{strength}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground text-sm italic">
                      Strengths will be identified based on your investment activity
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-amber-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base font-medium">Areas for Improvement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {data?.weaknesses && data.weaknesses.length > 0 ? (
                    <ul className="ml-6 list-disc [&>li]:mt-2">
                      {data.weaknesses.map((weakness, index) => (
                        <li key={`weakness-${index}`}>{weakness}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-muted-foreground text-sm italic">
                      Areas for improvement will be identified as you use the platform
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvestmentIntelligence; 