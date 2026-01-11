export default function TestSimple() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page - Simple</h1>
      <p>If you can see this, basic Next.js is working.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}