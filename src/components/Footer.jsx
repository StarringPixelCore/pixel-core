export default function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        For educational purposes only, and no copyright infringement is intended.
      </p>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ddd",
    padding: "24px",
    marginTop: "60px",
    textAlign: "center",
  },
  text: {
    margin: "0",
    fontSize: "13px",
    color: "#666",
    lineHeight: "1.6",
  },
};
