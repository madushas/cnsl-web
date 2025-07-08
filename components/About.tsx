import AboutClient from './AboutClient'

export default function About() {
  const aboutContent = {
    mission: {
      statement: "To foster a vibrant cloud-native community in Sri Lanka by empowering developers, organizations, and enthusiasts with cutting-edge knowledge, tools, and collaborative opportunities in cloud-native technologies."
    },
    highlights: [
      {
        stat: "500+",
        label: "Community Members",
        description: "Active developers and cloud enthusiasts"
      },
      {
        stat: "50+",
        label: "Events Hosted",
        description: "Workshops, meetups, and conferences"
      },
      {
        stat: "3+",
        label: "Years Active",
        description: "Building the cloud-native ecosystem"
      },
      {
        stat: "25+",
        label: "Industry Partners",
        description: "Leading organizations supporting our mission"
      }
    ],
    timeline: [
      {
        year: "2021",
        title: "Community Founded",
        description: "CNSL was established to bridge the gap in cloud-native knowledge and practices in Sri Lanka."
      },
      {
        year: "2022",
        title: "First Major Conference",
        description: "Hosted our inaugural cloud-native conference with international speakers and local experts."
      },
      {
        year: "2023",
        title: "University Partnerships",
        description: "Launched outreach programs with universities to educate the next generation of cloud-native developers."
      },
      {
        year: "2024",
        title: "Global Recognition",
        description: "Became an official CNCF community group and expanded our reach across the region."
      }
    ],
    team: [
      {
        name: "Community Leaders",
        role: "Organizers & Contributors",
        bio: "Passionate individuals driving the cloud-native movement in Sri Lanka through workshops, mentorship, and community building."
      },
      {
        name: "Technical Experts",
        role: "Speakers & Mentors",
        bio: "Industry professionals sharing their expertise in Kubernetes, DevOps, and cloud-native technologies."
      },
      {
        name: "University Partners",
        role: "Academic Collaborators",
        bio: "Faculty and students from leading universities contributing to research and education initiatives."
      },
      {
        name: "Industry Partners",
        role: "Corporate Sponsors",
        bio: "Forward-thinking organizations supporting our mission to advance cloud-native adoption in Sri Lanka."
      }
    ]
  } as const

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <header className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">Cloud Native Sri Lanka</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Empowering Sri Lanka&apos;s cloud-native ecosystem through community, education, and innovation.
          </p>
        </header>

        <AboutClient aboutContent={aboutContent} />
      </div>
    </section>
  )
}
