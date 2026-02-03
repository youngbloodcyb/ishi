"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Container, Section, Box } from "@/components/ds";
import { SectionHeader } from "@/components/site/section-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSuccess(true);
      toast.success("Message sent successfully");
      form.reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className="border-b border-border/40 relative min-h-screen flex items-center bg-muted/20">
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/20" />

      <Container>
        <Box className="py-20">
          <SectionHeader label="Contact" title="Get in Touch" centered />
          <p className="text-center text-lg text-muted-foreground max-w-xl mx-auto -mt-8 mb-12 leading-relaxed">
            Have questions about the template? Want to discuss custom features?
            We&apos;d love to hear from you.
          </p>

          <div className="mt-12 max-w-xl mx-auto">
            {isSuccess ? (
              <div className="text-center py-12 rounded-2xl border border-primary/20 bg-primary/5">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold tracking-tight mb-2">
                  Message Received
                </h3>
                <p className="text-muted-foreground text-sm">
                  We&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-sm font-medium text-primary hover:underline underline-offset-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 bg-card p-8 rounded-2xl border border-border/40 shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              disabled={isSubmitting}
                              className="bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@company.com"
                              disabled={isSubmitting}
                              className="bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background transition-colors"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Company
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Acme Inc."
                            disabled={isSubmitting}
                            className="bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Message
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your project..."
                            disabled={isSubmitting}
                            className="bg-muted/30 border-transparent focus:border-primary/20 focus:bg-background transition-colors min-h-[120px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold tracking-wide transition-all duration-200 ease-out bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </Box>
      </Container>
    </Section>
  );
};
