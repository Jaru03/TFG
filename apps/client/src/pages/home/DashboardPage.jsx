import HeroSection from "../../components/Dashboard/HeroSection";

export default function DashboardPage({ user }) {
  return (
    <>
      <main className="container">
        <HeroSection user={user} />
      </main>
    </>
  );
}
