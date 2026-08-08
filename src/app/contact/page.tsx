"use client";
// /contact — contact form (posts to /api/contact) + office info.

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactForm) {
    try {
      await api.post("/api/contact", values);
      toast.success("Message sent! We will get back to you soon.");
      reset();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to send message.";
      toast.error(msg);
    }
  }

  const info = [
    { icon: Mail, title: "Email", value: "support@rentnest.com", href: "mailto:support@rentnest.com" },
    { icon: Phone, title: "Phone", value: "+880 1700 000 000", href: "tel:+8801700000000" },
    { icon: MapPin, title: "Office", value: "Level 5, House 10, Road 5, Dhanmondi, Dhaka 1205" },
    { icon: Clock, title: "Hours", value: "Sun – Thu, 9:00 AM – 6:00 PM" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary">
          Get in <span className="gradient-text">Touch</span>
        </h1>
        <p className="text-text-secondary mt-2 max-w-xl mx-auto">
          Questions, feedback or need help? Drop us a line and we&apos;ll reply
          within one business day.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-4">
          {info.map(({ icon: Icon, title, value, href }) => (
            <div key={title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-accent-primary" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">{title}</p>
                {href ? (
                  <a
                    href={href}
                    className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-text-secondary">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <h2 className="font-bold text-text-primary mb-5 flex items-center gap-2">
              <MessageSquare size={18} className="text-accent-primary" /> Send us a message
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    className={`form-input ${errors.name ? "error" : ""}`}
                    placeholder="John Doe"
                    {...register("name")}
                    id="contact-name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="you@example.com"
                    {...register("email")}
                    id="contact-email"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Subject *
                </label>
                <input
                  className={`form-input ${errors.subject ? "error" : ""}`}
                  placeholder="How can we help?"
                  {...register("subject")}
                  id="contact-subject"
                />
                {errors.subject && (
                  <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="text-xs text-text-secondary mb-1.5 block uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  rows={6}
                  className={`form-input resize-none ${errors.message ? "error" : ""}`}
                  placeholder="Tell us a bit more…"
                  {...register("message")}
                  id="contact-message"
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
                id="contact-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
