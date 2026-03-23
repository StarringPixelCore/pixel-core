import Image from "next/image";
import styles from "./about.module.css";

export default function AboutPage() {
  const teamMembers = [
    { name: "Ria Cruz", image: "/team/ria.jpg" },
    { name: "Abigail Manalo", image: "/team/abi.jpg" },
    { name: "Hazel Mito", image: "/team/hazel.jpg" },
  ];

  const whyChoose = [
    {
      title: "100% Natural",
      description:
        "All products are made from natural coconut coir with no synthetic additives.",
    },
    {
      title: "Eco-Friendly",
      description:
        "Biodegradable and sustainable — reduces waste from coconut farming.",
    },
    {
      title: "Made in the Philippines",
      description:
        "Handcrafted by local artisans, supporting Philippine communities.",
    },
  ];

  const sources = [
    "All pictures are from the Internet. We do not claim ownership of any of the images used on this website.",
  ];

  return (
    <main className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <h1>About Us</h1>
      </section>

      {/* Why Choose CoCoir */}
      <section className={styles.whyChoose}>
        <h2>Why Choose CoCoir?</h2>
        <div className={styles.cards}>
          {whyChoose.map((item) => (
            <div key={item.title} className={styles.card}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Team */}
      <section className={styles.team}>
        <h2>We are Pixelcore</h2>
        <div className={styles.members}>
          {teamMembers.map((member) => (
            <div key={member.name} className={styles.member}>
              <div className={styles.circle}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className={styles.memberImage}
                />
              </div>
              <span>{member.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sources & References */}
      <section className={styles.sources}>
        <h2>Sources & References</h2>
        <ul>
          {sources.map((src) => (
            <li key={src}>{src}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}