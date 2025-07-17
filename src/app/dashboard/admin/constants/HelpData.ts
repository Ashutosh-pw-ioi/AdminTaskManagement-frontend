import { Mail, Phone } from "lucide-react";

export const helpItems = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Call us during business hours (9 AM - 6 PM)",
    action: "Call Now",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us your queries via email",
    action: "Send Email",
  },
];

export const faqs = [
  {
    question: "How do I use the Overview section?",
    answer:
      "The Overview section provides a comprehensive dashboard showing system-wide analytics, employee performance metrics, and key statistics. You can view total tasks, completion rates, department-wise performance, and get real-time insights into your organization's productivity and task management status.",
  },
  {
    question: "How do I create and manage Default Tasks?",
    answer:
      "Navigate to the 'Default Tasks' tab to create reusable task templates. You can set task descriptions, priorities, estimated completion times, categories, and assign departments. These templates serve as standardized tasks that can be quickly assigned to employees for recurring activities.",
  },
  {
    question: "How do I assign Daily Tasks to employees?",
    answer:
      "Use the 'Daily Tasks' tab to assign tasks from your default task instances or create new ones. Select employees or teams, set deadlines, add specific instructions, and choose priority levels. The system will automatically notify assigned employees and track completion status in real-time.",
  },
  {
    question: "How do I create New Tasks for employees?",
    answer:
      "The 'New Tasks' tab allows you to create custom, one-time tasks that aren't part of your default templates. Fill out the task form with details like title, description, assignee, due date, priority, and category. These tasks are immediately assigned and tracked like any other task.",
  },
  {
    question: "What information is available in the Help section?",
    answer:
      "The Help section contains comprehensive documentation, FAQs, troubleshooting guides, and user manuals for all admin features. You'll find step-by-step instructions for each tab, best practices for task management, and contact information for technical support.",
  },
  {
    question: "How can I monitor employee performance across all tabs?",
    answer:
      "Employee performance data is accessible throughout the system. The Overview shows aggregate metrics, Default Tasks displays template usage, Daily Tasks shows assignment patterns, and New Tasks tracks custom task completion. Use these insights to optimize task assignment and improve productivity.",
  },
];
