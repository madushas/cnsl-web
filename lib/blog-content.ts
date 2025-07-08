import { BlogPost } from "./types";

export interface Author {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

import ConnectProgramBlogImage from "@/assets/images/blogs/connect-program.png";
import k8sStarterGuideBlogImage from "@/assets/images/blogs/k8s-guide.png";
import ObservabilityBlogImage from "@/assets/images/blogs/observability.png";
import SecureK8sClusterGuideBlogImage from "@/assets/images/blogs/secure-k8s-guide.png";
import UnderstandCloudNativeArchitecturesBlogImage from "@/assets/images/blogs/understand-cloud-native.png";
import WelcomeBlogImage from "@/assets/images/blogs/welcome-blog.png";


export const authors: Author[] = [
  {
    id: 'cnsl-team',
    name: 'CNSL Team',
    title: 'Community Contributors',
    bio: 'The Cloud Native Sri Lanka team is composed of passionate individuals dedicated to growing the cloud-native ecosystem in Sri Lanka.',
    avatar: '/authors/cnsl-team.jpg'
  },
  {
    id: 'jane-doe',
    name: 'Jane Doe',
    title: 'Senior DevOps Engineer',
    bio: 'Jane is a seasoned DevOps engineer with 8+ years of experience in cloud-native technologies and container orchestration.',
    avatar: '/authors/jane-doe.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/janedoe',
      github: 'https://github.com/janedoe'
    }
  },
  {
    id: 'john-smith',
    name: 'John Smith',
    title: 'Platform Engineering Manager',
    bio: 'John specializes in building scalable platforms and has extensive experience with production Kubernetes deployments.',
    avatar: '/authors/john-smith.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: 'https://twitter.com/johnsmith'
    }
  },
  {
    id: 'sarah-wilson',
    name: 'Sarah Wilson',
    title: 'Cloud Security Architect',
    bio: 'Sarah is an expert in cloud security and compliance, helping organizations secure their cloud-native infrastructures.',
    avatar: '/authors/sarah-wilson.jpg',
    social: {
      linkedin: 'https://linkedin.com/in/sarahwilson'
    }
  },
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    title: 'Site Reliability Engineer',
    bio: 'Alex focuses on observability and monitoring in cloud-native environments and contributes to open-source projects.',
    avatar: '/authors/alex-chen.jpg',
    social: {
      github: 'https://github.com/alexchen',
      twitter: 'https://twitter.com/alexchen'
    }
  }
];

export const blogContent:{
  posts: BlogPost[];
} = {
  posts: [
    {
      id: '1',
      title: 'Welcome to Our New Blog',
      excerpt: 'We are excited to launch our new blog where we will share community updates, technical tutorials, and more.',
      date: '2024-12-01',
      category: 'Announcements',
      featured: true,
      tags: ['Announcements', 'Community'],
      image: WelcomeBlogImage,
      slug: 'welcome-to-our-new-blog',
      content: `
        <p>Welcome to our new blog! We are thrilled to have a platform where we can share updates, tutorials, and stories from our vibrant community. Stay tuned for regular posts that will help you stay informed and engaged with the latest in cloud-native technologies.</p>
        <p>In this first post, we want to introduce ourselves and outline what you can expect from our blog. Our mission is to provide valuable content that helps you grow as a cloud-native professional, whether you're just starting out or looking to deepen your expertise.</p>
        <p>Thank you for joining us on this journey!</p>
      `,
      author: 'CNSL Team',
      authorDetails: authors.find(a => a.id === 'cnsl-team'),
      readTime: '5 min read',
    },
    {
      id: '2',
      title: 'Getting Started with Kubernetes',
      excerpt: 'A beginner-friendly guide to understanding Kubernetes and how to deploy your first application.',
      date: '2024-11-28',
      category: 'Tutorials',
      tags: ['Kubernetes', 'Tutorial', 'Beginners'],
      image: k8sStarterGuideBlogImage,
      slug: 'getting-started-with-kubernetes',
      content: `
        <p>Kubernetes is a powerful platform for managing containerized applications. In this tutorial, we will walk you through the basics of Kubernetes, including how to set up a cluster and deploy your first application.</p>
        <p>By the end of this post, you will have a solid understanding of Kubernetes concepts and be ready to explore more advanced topics.</p>
      `,
      author: 'Jane Doe',
      authorDetails: authors.find(a => a.id === 'jane-doe'),
      readTime: '10 min read',
    },
    {
      id: '3',
      title: 'CNSL Connect: Mentorship Program Launch',
      excerpt: 'We are excited to announce the launch of our mentorship program, CNSL Connect, designed to connect aspiring cloud-native professionals with experienced mentors.',
      date: '2024-11-25',
      category: 'Announcements',
      tags: ['Mentorship', 'Community', 'Announcements'],
      image: ConnectProgramBlogImage,
      slug: 'cnsl-connect-mentorship-program-launch',
      content: `
        <p>At CNSL, we believe in the power of community and mentorship. Our new program, CNSL Connect, aims to pair aspiring cloud-native professionals with experienced mentors who can guide them on their journey.</p>
        <p>Whether you're looking for career advice, technical guidance, or just someone to bounce ideas off, our mentors are here to help. Stay tuned for more details on how to get involved!</p>
      `,
      author: 'CNSL Team',
      authorDetails: authors.find(a => a.id === 'cnsl-team'),
      readTime: '6 min read',
    },
    {
      id: '4',
      title: 'Understanding Cloud-Native Architectures',
      excerpt: 'An overview of cloud-native architectures and how they differ from traditional approaches.',
      date: '2024-11-20',
      category: 'Tutorials',
      tags: ['Cloud-Native', 'Architecture', 'Design Patterns'],
      image: UnderstandCloudNativeArchitecturesBlogImage,
      slug: 'understanding-cloud-native-architectures',
      content: `
        <p>Cloud-native architectures are designed to take full advantage of the cloud computing model. In this post, we will explore the key principles of cloud-native design, including microservices, containerization, and continuous delivery.</p>
        <p>By understanding these concepts, you can build applications that are more resilient, scalable, and easier to maintain.</p>
      `,
      author: 'John Smith',
      authorDetails: authors.find(a => a.id === 'john-smith'),
      readTime: '8 min read',
    },
    {
      id: '5',
      title: 'Securing Your Kubernetes Clusters',
      excerpt: 'Essential security practices for hardening your Kubernetes deployments and protecting your workloads.',
      date: '2024-11-15',
      category: 'Tutorials',
      tags: ['Security', 'Kubernetes', 'Best Practices'],
      image: SecureK8sClusterGuideBlogImage,
      slug: 'securing-kubernetes-clusters',
      content: `
        <p>Security should be a top priority when deploying applications to Kubernetes. This comprehensive guide covers essential security practices including RBAC, network policies, pod security standards, and secret management.</p>
        <p>Learn how to implement defense-in-depth strategies to protect your clusters and workloads from potential threats.</p>
      `,
      author: 'Sarah Wilson',
      authorDetails: authors.find(a => a.id === 'sarah-wilson'),
      readTime: '12 min read',
    },
    {
      id: '6',
      title: 'Observability in Cloud-Native Applications',
      excerpt: 'Learn how to implement comprehensive monitoring, logging, and tracing for your cloud-native applications.',
      date: '2024-11-10',
      category: 'Tutorials',
      tags: ['Observability', 'Monitoring', 'Prometheus', 'Grafana'],
      image: ObservabilityBlogImage,
      slug: 'observability-cloud-native-applications',
      content: `
        <p>Observability is crucial for understanding the behavior of complex cloud-native systems. This post explores the three pillars of observability: metrics, logs, and traces.</p>
        <p>We'll walk through setting up a complete observability stack using Prometheus, Grafana, and Jaeger to gain deep insights into your applications.</p>
      `,
      author: 'Alex Chen',
      authorDetails: authors.find(a => a.id === 'alex-chen'),
      readTime: '15 min read',
    },

    {
      id: '7',
      title: 'Advanced Kubernetes Networking',
      excerpt: 'Dive deep into Kubernetes networking concepts, including CNI plugins, service meshes, and network policies.',
      date: '2024-11-05',
      category: 'Tutorials',
      tags: ['Kubernetes', 'Networking', 'Service Mesh'],
      image: '/assets/images/blogs/advanced-k8s-networking.png',
      slug: 'advanced-kubernetes-networking',
      content: `
        <p>Kubernetes networking can be complex, but understanding it is essential for building robust applications. This post covers advanced topics such as CNI plugins, service meshes like Istio, and implementing network policies.</p>
        <p>Gain insights into how to design secure and efficient network architectures in your Kubernetes clusters.</p>
      `,
      author: 'John Smith',
      authorDetails: authors.find(a => a.id === 'john-smith'),
      readTime: '14 min read',
    },
    {
      id: '8',
      title: 'CI/CD for Cloud-Native Applications',
      excerpt: 'Best practices for implementing continuous integration and continuous deployment in cloud-native environments.',
      date: '2024-10-30',
      category: 'Tutorials',
      tags: ['CI/CD', 'DevOps', 'Automation'],
      image: '/assets/images/blogs/cicd-cloud-native.png',
      slug: 'cicd-cloud-native-applications',
      content: `
        <p>Continuous integration and deployment are key to delivering software quickly and reliably. This post explores best practices for setting up CI/CD pipelines in cloud-native environments using tools like Jenkins, GitLab CI, and ArgoCD.</p>
        <p>Learn how to automate your deployment processes and ensure high-quality releases.</p>
      `,
      author: 'Jane Doe',
      authorDetails: authors.find(a => a.id === 'jane-doe'),
      readTime: '13 min read',
    },
    {
      id: '9',
      title: 'Building Resilient Microservices',
      excerpt: 'Techniques for designing microservices that are resilient to failures and can scale effectively.',
      date: '2024-10-25',
      category: 'Tutorials',
      tags: ['Microservices', 'Resilience', 'Scalability'],
      image: '/assets/images/blogs/resilient-microservices.png',
      slug: 'building-resilient-microservices',
      content: `
        <p>Microservices architecture offers many benefits, but it also introduces challenges. This post discusses techniques for building resilient microservices, including circuit breakers, retries, and bulkheads.</p>
        <p>Discover how to design systems that can withstand failures and maintain high availability.</p>
      `,
      author: 'Sarah Wilson',
      authorDetails: authors.find(a => a.id === 'sarah-wilson'),
      readTime: '11 min read',
    },
    {
      id: '10',
      title: 'Serverless Architectures with Kubernetes',
      excerpt: 'Exploring how to implement serverless architectures using Kubernetes and tools like Knative.',
      date: '2024-10-20',
      category: 'Tutorials',
      tags: ['Serverless', 'Kubernetes', 'Knative'],
      image: '/assets/images/blogs/serverless-kubernetes.png',
      slug: 'serverless-architectures-kubernetes',
      content: `
        <p>Serverless computing is a powerful paradigm that allows you to focus on writing code without worrying about infrastructure. This post explores how to implement serverless architectures using Kubernetes and Knative.</p>
        <p>Learn how to build scalable, event-driven applications that can automatically scale based on demand.</p>
      `,
      author: 'Alex Chen',
      authorDetails: authors.find(a => a.id === 'alex-chen'),
      readTime: '12 min read',
    },

  ]
}