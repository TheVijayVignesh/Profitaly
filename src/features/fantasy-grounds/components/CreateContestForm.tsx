import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(5, {
    message: 'Contest name must be at least 5 characters.',
  }).max(100, {
    message: 'Contest name must be at most 100 characters.',
  }),
  description: z.string().max(500, {
    message: 'Description must be at most 500 characters.',
  }).optional(),
  platform: z.enum(['NYSE', 'NASDAQ', 'NSE', 'Crypto', 'Forex'], {
    required_error: 'Please select a platform.',
  }),
  market: z.enum(['NYSE', 'NASDAQ', 'NSE', 'Crypto', 'Forex'], {
    required_error: 'Please select a market.',
  }),
  startDate: z.date({
    required_error: 'Start date is required.',
  }),
  endDate: z.date({
    required_error: 'End date is required.',
  }),
  initialBalance: z.coerce.number().min(1000, {
    message: 'Initial balance must be at least $1,000.',
  }).max(1000000, {
    message: 'Initial balance must be at most $1,000,000.',
  }),
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date.',
  path: ['endDate'],
});

const CreateContestForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      initialBalance: 100000,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a contest',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create a new contest in Firestore
      const contestRef = await addDoc(collection(db, 'fantasyEvents'), {
        name: values.name,
        description: values.description || '',
        platform: values.platform,
        market: values.market,
        startDate: Timestamp.fromDate(values.startDate),
        endDate: Timestamp.fromDate(values.endDate),
        vaultSize: values.initialBalance,
        createdBy: currentUser.uid,
        creatorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        creatorPhoto: currentUser.photoURL || null,
        participantCount: 1, // Creator is the first participant
        createdAt: serverTimestamp(),
      });
      
      // Add creator as the first participant
      await addDoc(collection(db, 'fantasyEvents', contestRef.id, 'participants'), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        photoURL: currentUser.photoURL || null,
        joinedAt: serverTimestamp(),
        ROI: 0,
        vaultBalance: values.initialBalance
      });
      
      // Create user vault for this event
      await addDoc(collection(db, 'users', currentUser.uid, 'fantasyState'), {
        eventId: contestRef.id,
        market: values.market,
        vaultBalance: values.initialBalance,
        initialVault: values.initialBalance,
        holdings: [],
        transactions: [],
        joinedAt: serverTimestamp()
      });
      
      // Add user to leaderboard
      await addDoc(collection(db, 'fantasyEvents', contestRef.id, 'leaderboard'), {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        photoURL: currentUser.photoURL || null,
        ROI: 0,
        vaultBalance: values.initialBalance,
        lastUpdated: serverTimestamp()
      });
      
      toast({
        title: 'Contest Created',
        description: 'Your contest has been created successfully.',
      });
      
      // Navigate to the contest page
      navigate(`/fantasy-grounds/dashboard/${contestRef.id}`);
    } catch (error) {
      console.error('Error creating contest:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contest',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Contest</CardTitle>
        <CardDescription>
          Set up a new stock market contest for other investors to join
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contest Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Tech Stock Challenge 2025" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your contest a catchy and descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the goals and rules of your contest..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide additional details about your contest
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NYSE">NYSE (New York Stock Exchange)</SelectItem>
                        <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                        <SelectItem value="NSE">NSE (National Stock Exchange of India)</SelectItem>
                        <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="Forex">Foreign Exchange</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which platform to use for this contest
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="market"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a market" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NYSE">NYSE (New York Stock Exchange)</SelectItem>
                        <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                        <SelectItem value="NSE">NSE (National Stock Exchange of India)</SelectItem>
                        <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="Forex">Foreign Exchange</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which market to use for this contest
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the contest will begin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date <= form.getValues("startDate")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the contest will end
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="initialBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Balance</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        type="number"
                        placeholder="100000"
                        className="pl-6"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Starting amount for each participant (default: $100,000)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Contest'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateContestForm;
