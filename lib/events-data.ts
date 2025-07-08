import { DatabaseEvent, Speaker } from "./types";

import Event1Image from '@/assets/images/events/meetup-1.jpeg';
import Event2Image from '@/assets/images/events/meetup-2.jpeg';
import Event3Image from '@/assets/images/events/meetup-3.jpeg';
import Event4Image from '@/assets/images/events/meetup-4.jpeg';

const Event5Image = Event1Image; // Placeholder for the 5th event image
const Event6Image = Event2Image; // Placeholder for the 6th event image
const Event7Image = Event3Image; // Placeholder for the 7th event image
const Event8Image = Event4Image; // Placeholder for the 8th event image

export const speakers: Speaker[] = [
  {
    id: "jane-doe",
    name: "Jane Doe",
    title: "Senior DevOps Engineer",
    company: "TechCorp International",
    bio: "Jane is a seasoned DevOps engineer with 8+ years of experience in cloud-native technologies. She has led multiple Kubernetes migrations and is passionate about sharing knowledge.",
    expertise: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"],
    image: "/speakers/jane-doe.jpg",
    social: {
      linkedin: "https://linkedin.com/in/janedoe",
      twitter: "https://twitter.com/janedoe",
      github: "https://github.com/janedoe"
    }
  },
  {
    id: "john-smith",
    name: "John Smith",
    title: "Platform Engineering Manager",
    company: "CloudScale Solutions",
    bio: "John specializes in building scalable platforms and has extensive experience with production Kubernetes deployments. He's been with CNSL since the beginning.",
    expertise: ["Kubernetes", "Platform Engineering", "Monitoring", "Service Mesh"],
    image: "/speakers/john-smith.jpg",
    social: {
      linkedin: "https://linkedin.com/in/johnsmith",
      github: "https://github.com/johnsmith"
    }
  },
  {
    id: "sarah-wilson",
    name: "Sarah Wilson",
    title: "Cloud Security Architect",
    company: "SecureCloud Inc",
    bio: "Sarah is an expert in cloud security and compliance. She helps organizations secure their cloud-native infrastructures and implement best practices.",
    expertise: ["Security", "Compliance", "Zero Trust", "Policy as Code"],
    image: "/speakers/sarah-wilson.jpg",
    social: {
      linkedin: "https://linkedin.com/in/sarahwilson"
    }
  },
  {
    id: "alex-chen",
    name: "Alex Chen",
    title: "Site Reliability Engineer",
    company: "Global Tech",
    bio: "Alex focuses on observability and monitoring in cloud-native environments. He's contributed to several open-source monitoring tools.",
    expertise: ["Observability", "Prometheus", "Grafana", "SRE", "Monitoring"],
    image: "/speakers/alex-chen.jpg",
    social: {
      github: "https://github.com/alexchen",
      twitter: "https://twitter.com/alexchen"
    }
  }
];

export const events: DatabaseEvent[] = [
  {
    id: "cnsl-meetup-1",
    title: "Cloud Native Meetup #1",
    slug: "cloud-native-meetup-1",
    eventDate: "July 20, 2025",
    eventTime: "2:00 PM - 5:00 PM",
    location: "Hatch, Colombo",
    currentAttendees: 85,
    maxAttendees: 100,
    imageUrl: Event1Image.src,
    createdAt: "2024-06-01T10:00:00Z",
    published: true,
    updatedAt: "2024-06-15T12:00:00Z",
    speakerDetails: [speakers[0], speakers[1], speakers[2]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Introduction to Kubernetes - Learn the fundamentals of container orchestration.",
    longDescription: "Join us for our inaugural meetup! This session is perfect for beginners looking to understand the core concepts of Kubernetes. We'll cover pods, services, deployments, and get you started with your first application on a cluster. There will be plenty of time for Q&A and networking.",
    topics: ["Kubernetes", "Container Orchestration", "DevOps", "Docker"],
    registrationUrl: "https://example.com/register/meetup-1",
    eventType: "meetup",
    difficulty: "beginner"
  },
  {
    id: "cnsl-workshop-1",
    title: "Cloud Native Workshop",
    slug: "cloud-native-workshop",
    eventDate: "August 10, 2025",
    eventTime: "10:00 AM - 4:00 PM",
    location: "TechSpace, Colombo",
    currentAttendees: 50,
    maxAttendees: 60,
    imageUrl: Event2Image.src,
    createdAt: "2024-07-01T10:00:00Z",
    published: true,
    updatedAt: "2024-07-15T12:00:00Z",
    speakerDetails: [speakers[1], speakers[3]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Hands-on workshop on deploying applications with Kubernetes.",
    longDescription: "This full-day workshop will take you through the process of deploying a cloud-native application using Kubernetes. You'll learn how to set up a cluster, deploy applications, manage configurations, and scale your services. Bring your laptop and get ready for hands-on learning!",
    topics: ["Kubernetes", "Hands-on", "Deployment", "CI/CD"],
    registrationUrl: "https://example.com/register/workshop-1",
    eventType: "workshop",
    difficulty: "intermediate"
  },
  {
    id: "cnsl-meetup-2",
    title: "Cloud Native Meetup #2",
    slug: "cloud-native-meetup-2",
    eventDate: "September 15, 2025",
    eventTime: "3:00 PM - 6:00 PM",
    location: "Innovate Hub, Colombo",
    currentAttendees: 40,
    maxAttendees: 80,
    imageUrl: Event3Image.src,
    createdAt: "2024-08-01T10:00:00Z",
    published: true,
    updatedAt: "2024-08-20T12:00:00Z",
    speakerDetails: [speakers[0], speakers[2]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Exploring Service Mesh - Enhance your microservices architecture.",
    longDescription: "Dive into the world of service mesh technologies. Learn how tools like Istio can improve observability, security, and traffic management in your microservices architecture. Perfect for intermediate-level attendees.",
    topics: ["Service Mesh", "Istio", "Microservices", "Cloud Native"],
    registrationUrl: "https://example.com/register/meetup-2",
    eventType: "meetup",
    difficulty: "intermediate"
  },
  {
    id: "cnsl-workshop-2",
    title: "Advanced Kubernetes Workshop",
    slug: "advanced-kubernetes-workshop",
    eventDate: "October 5, 2025",
    eventTime: "9:00 AM - 5:00 PM",
    location: "TechSpace, Colombo",
    currentAttendees: 30,
    maxAttendees: 50,
    imageUrl: Event4Image.src,
    createdAt: "2024-09-01T10:00:00Z",
    published: true,
    updatedAt: "2024-09-15T12:00:00Z",
    speakerDetails: [speakers[1], speakers[3]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Master Kubernetes - Advanced techniques for production environments.",
    longDescription: "This workshop is designed for experienced Kubernetes users. Learn advanced techniques for managing production clusters, including scaling, monitoring, and troubleshooting. Bring your laptop for hands-on exercises.",
    topics: ["Kubernetes", "Scaling", "Monitoring", "Troubleshooting"],
    registrationUrl: "https://example.com/register/workshop-2",
    eventType: "workshop",
    difficulty: "advanced"
  },
  {
    id: "cnsl-meetup-3",
    title: "Cloud Native Meetup #3",
    slug: "cloud-native-meetup-3",
    eventDate: "June 10, 2025",
    eventTime: "2:00 PM - 5:00 PM",
    location: "Hatch, Colombo",
    currentAttendees: 70,
    maxAttendees: 100,
    imageUrl: Event5Image.src,
    createdAt: "2024-05-01T10:00:00Z",
    published: true,
    updatedAt: "2024-05-15T12:00:00Z",
    speakerDetails: [speakers[0], speakers[1]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Introduction to Observability - Learn how to monitor your applications.",
    longDescription: "This session focuses on observability in cloud-native environments. Learn how to use tools like Prometheus and Grafana to monitor your applications effectively. Ideal for beginners and intermediate attendees.",
    topics: ["Observability", "Prometheus", "Grafana", "Monitoring"],
    registrationUrl: "https://example.com/register/meetup-3",
    eventType: "meetup",
    difficulty: "beginner"
  },
  {
    id: "cnsl-workshop-3",
    title: "Cloud Security Workshop",
    slug: "cloud-security-workshop",
    eventDate: "May 20, 2025",
    eventTime: "10:00 AM - 4:00 PM",
    location: "TechSpace, Colombo",
    currentAttendees: 45,
    maxAttendees: 60,
    imageUrl: Event6Image.src,
    createdAt: "2024-04-01T10:00:00Z",
    published: true,
    updatedAt: "2024-04-15T12:00:00Z",
    speakerDetails: [speakers[2], speakers[3]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Securing Cloud-Native Applications - Best practices for security and compliance.",
    longDescription: "Learn how to secure your cloud-native applications and implement compliance standards. This workshop covers zero trust architecture, policy as code, and other security best practices.",
    topics: ["Security", "Compliance", "Zero Trust", "Policy as Code"],
    registrationUrl: "https://example.com/register/workshop-3",
    eventType: "workshop",
    difficulty: "intermediate"
  },
  {
    id: "cnsl-meetup-4",
    title: "Cloud Native Meetup #4",
    slug: "cloud-native-meetup-4",
    eventDate: "April 15, 2025",
    eventTime: "3:00 PM - 6:00 PM",
    location: "Innovate Hub, Colombo",
    currentAttendees: 60,
    maxAttendees: 80,
    imageUrl: Event7Image.src,
    createdAt: "2024-03-01T10:00:00Z",
    published: true,
    updatedAt: "2024-03-20T12:00:00Z",
    speakerDetails: [speakers[0], speakers[2]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Scaling Kubernetes - Techniques for managing large clusters.",
    longDescription: "This meetup focuses on scaling Kubernetes clusters for large-scale applications. Learn about horizontal pod autoscaling, cluster federation, and other advanced techniques.",
    topics: ["Kubernetes", "Scaling", "Cluster Federation", "Autoscaling"],
    registrationUrl: "https://example.com/register/meetup-4",
    eventType: "meetup",
    difficulty: "advanced"
  },
  {
    id: "cnsl-workshop-4",
    title: "Observability Workshop",
    slug: "observability-workshop",
    eventDate: "March 10, 2025",
    eventTime: "9:00 AM - 5:00 PM",
    location: "TechSpace, Colombo",
    currentAttendees: 55,
    maxAttendees: 60,
    imageUrl: Event8Image.src,
    createdAt: "2024-02-01T10:00:00Z",
    published: true,
    updatedAt: "2024-02-15T12:00:00Z",
    speakerDetails: [speakers[3]].filter((speaker): speaker is Speaker => speaker !== undefined),
    description: "Mastering Observability - Tools and techniques for cloud-native environments.",
    longDescription: "This workshop covers advanced observability techniques using Prometheus, Grafana, and other tools. Learn how to set up dashboards, alerts, and gain insights into your applications.",
    topics: ["Observability", "Prometheus", "Grafana", "Monitoring"],
    registrationUrl: "https://example.com/register/workshop-4",
    eventType: "workshop",
    difficulty: "advanced"
  }
];
