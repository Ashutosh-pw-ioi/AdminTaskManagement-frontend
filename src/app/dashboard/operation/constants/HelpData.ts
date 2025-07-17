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
    question: "How can I view my assigned tasks?",
    answer:
      "To view your assigned tasks, navigate to the 'Daily Tasks' or 'New Tasks' section from the sidebar. You'll see a table listing your tasks along with details like title, description, priority, due date, and who assigned them.",
  },
  {
    question: "Can I update the status of a task?",
    answer:
      "Yes, you can update any task status directly from the table view. Simply select a task and choose from available statuses like 'Pending', 'In Progress', or 'Completed' using the dropdown in the status column.",
  },
  {
    question: "What’s the difference between Daily Tasks and New Tasks?",
    answer:
      "'Daily Tasks' are your ongoing tasks that need regular attention, while 'New Tasks' are recently assigned items that haven’t been addressed yet. This separation helps prioritize your daily workload efficiently.",
  },
  {
    question: "What information is shown for each task?",
    answer:
      "Each task includes key details such as Title, Description, Priority (Low, Medium, High), Due Date, Assigned By, and Current Status. This helps you stay organized and understand what needs to be done at a glance.",
  },
  {
    question: "Where can I see a summary of my progress?",
    answer:
      "Go to the 'Overview' section to get an analytical summary of your tasks. You'll find charts or graphs representing completed vs. pending tasks, priority breakdowns, and daily activity stats to help you track performance.",
  },
  {
    question: "How can I get help if I’m stuck?",
    answer:
      "Click the 'Help' button in the sidebar (highlighted in gold). It opens a list of frequently asked questions like this, along with contact info for reaching out to support if needed.",
  },
];
