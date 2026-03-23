import Image from "next/image";
import {
  Leaf,
  Recycle,
  HandHelping,
  Users,
  Sprout,
  ShieldCheck,
} from "lucide-react";
import styles from "./about.module.css";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Ria Cruz",
      image: "/team/ria.jpg",
      role: "Full Stack Developer",
      description:
        "Contributes to both the frontend and backend development of CoCoir, ensuring a seamless user experience.",
    },
    {
      name: "Abigail Manalo",
      image: "/team/abi.jpg",
      role: "Leader",
      description:
        "Leads the team in shaping the overall direction of CoCoir.",
    },
    {
      name: "Hazel Mito",
      image: "/team/hazel.jpg",
      role: "Full Stack Developer",
      description:
        "Works on both the frontend and backend development of CoCoir, ensuring a seamless user experience.",
    },
  ];

  const whyChoose = [
    {
      title: "100% Natural",
      description:
        "Our products are made from coconut coir, a natural and renewable material.",
      icon: <Leaf size={28} strokeWidth={2.2} />,
    },
    {
      title: "Eco-Friendly",
      description:
        "CoCoir promotes sustainable practices by transforming agricultural waste into useful products.",
      icon: <Recycle size={28} strokeWidth={2.2} />,
    },
    {
      title: "Made in the Philippines",
      description:
        "We celebrate locally inspired products that reflect Filipino craftsmanship and innovation.",
      icon: <HandHelping size={28} strokeWidth={2.2} />,
    },
  ];

  const sources = [
    "All pictures are from the Internet. We do not claim ownership of any of the images used on this website.",
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}>
          <h1>About Us</h1>
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>Our Purpose</span>
          <h2>Mission</h2>
        </div>

        <div className={styles.missionCard}>
          <div className={styles.missionIconWrap}>
            <Sprout size={34} strokeWidth={2.2} />
          </div>
          <div>
            <p className={styles.missionText}>
              CoCoir aims to promote sustainable living through coconut coir-based
              products that are practical, eco-friendly, and locally inspired. We
              want to show how natural materials can become valuable everyday
              solutions while encouraging people to support greener choices.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.whyChoose}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>What Makes Us Different</span>
          <h2>Why Choose CoCoir</h2>
        </div>

        <div className={styles.cards}>
          {whyChoose.map((item) => (
            <div key={item.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.companySection}>
        <div className={styles.companyLogoCard}>
          <Image
            src="/images/logo.png"
            alt="CoCoir Logo"
            width={220}
            height={220}
            className={styles.companyLogo}
          />
        </div>

        <div className={styles.companyInfo}>
          <span className={styles.sectionTag}>Who We Are</span>
          <h2>CoCoir Philippines</h2>
          <p>
            CoCoir is a concept brand centered on sustainability, creativity, and
            local value. By highlighting products made from coconut coir, we aim
            to present practical alternatives that are both environmentally
            responsible and visually appealing.
          </p>
          <p>
            Our goal is to inspire more people to appreciate natural materials and
            recognize how innovation can transform simple resources into products
            with real purpose.
          </p>

          <div className={styles.companyHighlights}>
            <div className={styles.highlightItem}>
              <ShieldCheck size={18} />
              <span>Sustainable product focus</span>
            </div>
            <div className={styles.highlightItem}>
              <Users size={18} />
              <span>Student-driven vision</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.team}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>Meet the Team</span>
          <h2>We are Pixelcore</h2>
        </div>

        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.name} className={styles.memberCard}>
              <div className={styles.memberImageWrap}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={320}
                  height={320}
                  className={styles.memberImage}
                />
              </div>

              <div className={styles.memberContent}>
                <h3>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
                <p className={styles.memberDescription}>{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sources}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>Acknowledgement</span>
          <h2>Sources & References</h2>
        </div>

        <div className={styles.sourcesCard}>
          <ul>
            {sources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}